"""Shared cleaning + feature code. Used by training AND by the predictor, so
training/serving features are identical (no train/serve skew)."""
from __future__ import annotations
import numpy as np, pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW, PROC, MODELS, REPORTS = (ROOT / p for p in ("data/raw", "data/processed", "models", "reports"))

EPOCH = pd.Timestamp("1970-01-01")
MK_KEY = ["commodity", "market", "variety", "grade"]
CAT_COLS = ["commodity", "state", "district", "market", "variety", "grade"]
CAT_FEATURES = [c + "_c" for c in CAT_COLS]
# district/market identity is NOT a model feature (it hurt on unseen weeks); local info enters via lag features
FEATURES = ["commodity_c", "state_c", "variety_c", "grade_c", "month", "dow", "doy_sin", "doy_cos",
            "lag1", "lag2", "lag3", "mk_mean3", "mk_gap", "st7", "st30", "nat30", "anchor",
            "st_diff", "trend", "lag_gap12"]

STATE_FIX = {"tamilnadu": "Tamil Nadu", "orissa": "Odisha", "chattisgarh": "Chhattisgarh",
             "uttrakhand": "Uttarakhand", "nct of delhi": "Delhi", "jammu & kashmir": "Jammu and Kashmir",
             "gao": "Goa", "pondicherry": "Puducherry",
             "andaman and nicobar": "Andaman and Nicobar Islands"}
COMMODITY_FIX = {"cardamoms": "cardamom"}
COLS = ["state", "district", "market", "commodity", "variety", "grade",
        "min_price", "max_price", "modal_price", "date"]


# ----------------------------------------------------------------- loading / cleaning
def load_raw() -> pd.DataFrame:
    a = pd.read_csv(RAW / "Agriculture_price_dataset.csv").rename(columns={
        "STATE": "state", "District Name": "district", "Market Name": "market", "Commodity": "commodity",
        "Variety": "variety", "Grade": "grade", "Min_Price": "min_price", "Max_Price": "max_price",
        "Modal_Price": "modal_price", "Price Date": "date"})
    a["date"] = pd.to_datetime(a["date"], format="%m/%d/%Y", errors="coerce")
    b = pd.read_csv(RAW / "dataset_2026.csv").rename(columns={
        "State": "state", "District": "district", "Market": "market", "Commodity": "commodity",
        "Variety": "variety", "Grade": "grade", "Min_Price": "min_price", "Max_Price": "max_price",
        "Modal_Price": "modal_price", "Arrival_Date": "date"})
    b["date"] = pd.to_datetime(b["date"], format="%Y-%m-%d", errors="coerce")
    return pd.concat([a[COLS], b[COLS]], ignore_index=True)


def clean(df: pd.DataFrame, max_commodities: int = 254, min_rows: int = 300):
    log = {"rows_raw": len(df)}
    df = df.copy()
    for c in ["state", "district", "market", "commodity", "variety", "grade"]:
        df[c] = df[c].astype(str).str.strip().str.lower().str.replace(r"\s+", " ", regex=True)
    df["state"] = df["state"].map(lambda s: STATE_FIX.get(s, s.title()))
    df["commodity"] = df["commodity"].replace(COMMODITY_FIX)
    df["market"] = df["market"].str.replace(r"\s+apmc$", "", regex=True).str.strip()
    n = len(df); df = df.dropna(subset=["date", "min_price", "max_price", "modal_price"])
    log["dropped_missing"] = n - len(df)
    n = len(df); df = df[(df[["min_price", "max_price", "modal_price"]] > 0).all(axis=1)]
    log["dropped_nonpositive_price"] = n - len(df)
    sw = df.min_price > df.max_price
    df.loc[sw, ["min_price", "max_price"]] = df.loc[sw, ["max_price", "min_price"]].to_numpy()
    log["min_max_swapped"] = int(sw.sum())
    n = len(df); df = df[(df.modal_price >= df.min_price * 0.999) & (df.modal_price <= df.max_price * 1.001)]
    log["dropped_modal_outside_min_max"] = n - len(df)
    n = len(df); df = df[df.max_price / df.min_price <= 10]
    log["dropped_extreme_range"] = n - len(df)
    med = df.groupby("commodity").modal_price.transform("median")
    n = len(df); df = df[np.abs(np.log(df.modal_price / med)) <= np.log(6)]
    log["dropped_price_outliers_vs_commodity_median"] = n - len(df)
    n = len(df); df = df.drop_duplicates(MK_KEY + ["date"], keep="last")
    log["dropped_duplicates"] = n - len(df)
    vc = df.commodity.value_counts()
    keep = vc[vc >= min_rows].index[:max_commodities]
    n = len(df); df = df[df.commodity.isin(keep)]
    log["dropped_rare_commodities"] = n - len(df)
    df = df.reset_index(drop=True)
    df["log_modal"] = np.log(df.modal_price).astype("float64")
    log["rows_clean"] = len(df); log["commodities"] = int(df.commodity.nunique())
    return df, log


# ----------------------------------------------------------------- feature helpers
def day_number(s: pd.Series) -> np.ndarray:
    return (pd.to_datetime(s) - EPOCH).dt.days.to_numpy().astype("int64")


def build_daily(df, keys):
    d = df.assign(day=day_number(df["date"])).groupby(keys + ["day"], sort=True).log_modal.agg(["sum", "count"])
    return d.reset_index().rename(columns={"sum": "s", "count": "n"})


def window_mean(daily, keys, q, qday, w):
    """Mean log price of group `keys` over days [qday-w, qday-1] (strictly before the query day)."""
    daily = daily.sort_values(keys + ["day"]).reset_index(drop=True)
    gmap = daily[keys].drop_duplicates().reset_index(drop=True)
    gmap["gid"] = np.arange(len(gmap))
    daily = daily.merge(gmap, on=keys, how="left")
    K = 100000
    key = daily.gid.to_numpy().astype("int64") * K + daily.day.to_numpy()
    o = np.argsort(key, kind="stable"); key = key[o]
    cs = np.concatenate([[0.0], np.cumsum(daily.s.to_numpy()[o])])
    cn = np.concatenate([[0], np.cumsum(daily.n.to_numpy()[o])])
    qg = q[keys].reset_index(drop=True).merge(gmap, on=keys, how="left").gid.to_numpy()
    ok = ~np.isnan(qg)
    qk = np.where(ok, np.nan_to_num(qg).astype("int64") * K + qday, 0)
    lo = np.searchsorted(key, qk - w, "left"); hi = np.searchsorted(key, qk, "left")
    n = cn[hi] - cn[lo]
    return np.where(ok & (n > 0), (cs[hi] - cs[lo]) / np.maximum(n, 1), np.nan)


def fit_encoders(df, max_commodities=254, max_other=250):
    enc = {}
    for c in CAT_COLS:
        top = df[c].value_counts().index[: max_commodities if c == "commodity" else max_other]
        enc[c] = {v: i for i, v in enumerate(top)}
    return enc


def finish_features(df, enc, comm_median):
    d = pd.to_datetime(df["date"])
    df["month"] = d.dt.month; df["dow"] = d.dt.dayofweek
    doy = d.dt.dayofyear
    df["doy_sin"] = np.sin(2 * np.pi * doy / 365.25); df["doy_cos"] = np.cos(2 * np.pi * doy / 365.25)
    a = df["mk_mean3"].copy()
    for c in ["st7", "st30", "nat30"]:
        a = a.fillna(df[c])
    df["anchor"] = a.fillna(df["commodity"].map(comm_median))
    for c in CAT_COLS:
        df[c + "_c"] = df[c].map(enc[c]).fillna(-1).astype("int16")   # -1 = unseen -> treated as missing
    df["st_diff"] = df["st7"] - df["anchor"]          # state-level recent price vs anchor
    df["trend"] = df["st7"] - df["st30"]              # short-term momentum
    df["lag_gap12"] = df["lag1"] - df["lag2"]         # last price move in this market
    return df


def training_features(df, enc, comm_median):
    df = df.sort_values(MK_KEY + ["date"]).reset_index(drop=True)
    g = df.groupby(MK_KEY, sort=False)
    for k in (1, 2, 3):
        df[f"lag{k}"] = g.log_modal.shift(k)
    df["mk_gap"] = (df["date"] - g["date"].shift(1)).dt.days
    df["mk_mean3"] = df[["lag1", "lag2", "lag3"]].mean(axis=1)
    day = day_number(df["date"])
    sd = build_daily(df, ["commodity", "state"]); nd = build_daily(df, ["commodity"])
    df["st7"] = window_mean(sd, ["commodity", "state"], df, day, 7)
    df["st30"] = window_mean(sd, ["commodity", "state"], df, day, 30)
    df["nat30"] = window_mean(nd, ["commodity"], df, day, 30)
    return finish_features(df, enc, comm_median)


# ----------------------------------------------------------------- serving-time history
def _last3(d, keys):
    d = d.sort_values(keys + ["date"]).copy()
    d["r"] = d.groupby(keys, sort=False).cumcount(ascending=False)
    t = d[d.r < 3]
    out = t[t.r == 0][keys + ["log_modal", "date"]].rename(columns={"log_modal": "lag1", "date": "last_date"})
    for k, r in ((2, 1), (3, 2)):
        out = out.merge(t[t.r == r][keys + ["log_modal"]].rename(columns={"log_modal": f"lag{k}"}), on=keys, how="left")
    return out.reset_index(drop=True)


def build_history(df):
    last_day = int(day_number(df["date"]).max())
    recent = df[day_number(df["date"]) >= last_day - 45]
    mode = lambda c: df.groupby("commodity")[c].agg(lambda s: s.value_counts().index[0]).to_dict()
    return {"mk": _last3(df, MK_KEY), "mk2": _last3(df, ["commodity", "market"]),
            "st_daily": build_daily(recent, ["commodity", "state"]), "nat_daily": build_daily(recent, ["commodity"]),
            "last_day": last_day, "last_date": str(df["date"].max().date()),
            "default_variety": mode("variety"), "default_grade": mode("grade")}


def query_features(hist, enc, comm_median, q):
    q = q.reset_index(drop=True).copy()
    q["date"] = pd.to_datetime(q["date"])
    q["variety"] = q["variety"].where(q["variety"].notna(), q["commodity"].map(hist["default_variety"]))
    q["grade"] = q["grade"].where(q["grade"].notna(), q["commodity"].map(hist["default_grade"]))
    m = q[MK_KEY].merge(hist["mk"], on=MK_KEY, how="left")
    m2 = q[["commodity", "market"]].merge(hist["mk2"], on=["commodity", "market"], how="left")
    miss = m["lag1"].isna()
    q["basis_exact"] = ~miss
    for c in ["lag1", "lag2", "lag3", "last_date"]:
        m[c] = m[c].where(~miss, m2[c])
    for k in (1, 2, 3):
        q[f"lag{k}"] = m[f"lag{k}"].astype(float)
    q["mk_gap"] = (q["date"] - pd.to_datetime(m["last_date"])).dt.days.clip(lower=0)
    q["mk_mean3"] = q[["lag1", "lag2", "lag3"]].mean(axis=1)
    eff = np.minimum(day_number(q["date"]), hist["last_day"] + 1)
    q["st7"] = window_mean(hist["st_daily"], ["commodity", "state"], q, eff, 7)
    q["st30"] = window_mean(hist["st_daily"], ["commodity", "state"], q, eff, 30)
    q["nat30"] = window_mean(hist["nat_daily"], ["commodity"], q, eff, 30)
    return finish_features(q, enc, comm_median)
