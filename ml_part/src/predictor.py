"""Inference wrapper for the FastAPI backend.

    from predictor import PricePredictor
    predictor = PricePredictor.load()                     # call ONCE in FastAPI startup event
    predictor.predict("onion", "Maharashtra", "2026-04-22", market="lasalgaon(niphad)")

Prices are Rs per quintal (100 kg) -- same unit as the mandi data.
"""
from __future__ import annotations
import numpy as np, pandas as pd, joblib
from pathlib import Path
from common import FEATURES, query_features

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "price_model.pkl"


class PricePredictor:
    def __init__(self, bundle):
        self.b = bundle
        self.meta = bundle["meta"]

    @classmethod
    def load(cls, path=MODEL_PATH):
        return cls(joblib.load(path))

    def commodities(self):
        return sorted(self.b["enc"]["commodity"])

    def predict_df(self, q: pd.DataFrame) -> pd.DataFrame:
        """q columns: commodity, state, date  (+ optional district, market, variety, grade). Text is lower-cased here."""
        q = q.copy()
        for c in ["district", "market", "variety", "grade"]:
            if c not in q: q[c] = np.nan
        for c in ["commodity", "state", "district", "market", "variety", "grade"]:
            q[c] = q[c].astype("string").str.strip().str.lower().astype(object).where(q[c].notna(), np.nan)
        q["state"] = q["state"].str.title()
        unknown = set(q.commodity) - set(self.b["enc"]["commodity"])
        if unknown:
            raise ValueError(f"Unknown commodity {sorted(unknown)}. Use predictor.commodities().")
        f = query_features(self.b["hist"], self.b["enc"], self.b["comm_median"], q)
        X = f[FEATURES].to_numpy("float32")
        modal = np.exp(f["anchor"].to_numpy() + self.b["modal"].predict(X))
        lo = modal * np.exp(np.minimum(self.b["min"].predict(X), 0))
        hi = modal * np.exp(np.maximum(self.b["max"].predict(X), 0))
        basis = np.select([f.basis_exact & f.lag1.notna(), f.lag1.notna(), f.st7.notna() | f.st30.notna(), f.nat30.notna()],
                          ["market history (exact variety/grade)", "market history (same crop, other variety)",
                           "state average of recent days", "national average of recent days"], "long-run crop median")
        out = pd.DataFrame({"commodity": f.commodity, "state": f.state, "date": f.date.dt.date.astype(str),
                            "min_price": lo.round(0), "modal_price": modal.round(0), "max_price": hi.round(0),
                            "basis": basis,
                            "typical_error_pct": f.commodity.map(self.b["mape_by_commodity"])})
        return out

    def predict(self, commodity, state, date, district=None, market=None, variety=None, grade=None) -> dict:
        r = self.predict_df(pd.DataFrame([dict(commodity=commodity, state=state, date=date, district=district,
                                               market=market, variety=variety, grade=grade)])).iloc[0]
        d = r.to_dict()
        d["unit"] = "Rs/quintal"
        d["model_data_last_date"] = self.meta["data_last_date"]
        return d


if __name__ == "__main__":
    p = PricePredictor.load()
    print("data until", p.meta["data_last_date"], "| commodities:", len(p.commodities()))
    for args in [("onion", "Maharashtra", "2026-04-22", "nashik", "lasalgaon(niphad)"),
                 ("tomato", "Karnataka", "2026-04-22"), ("wheat", "Punjab", "2026-04-22"),
                 ("potato", "Uttar Pradesh", "2026-04-22")]:
        print(p.predict(*args))
