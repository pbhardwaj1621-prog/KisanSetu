function monthName(i) {
  try { return new Date(2024, i, 1).toLocaleString(lang === "en" ? "en-IN" : lang, { month: "short" }); }
  catch (e) { return String(i + 1); }
}

function fillMonths() {
  const sel = document.getElementById("month");
  const keep = sel.value || String(new Date().getMonth());
  sel.innerHTML = "";
  for (let i = 0; i < 12; i++) {
    const o = document.createElement("option");
    o.value = i; o.textContent = monthName(i);
    sel.appendChild(o);
  }
  sel.value = keep;
}

function predictNow() {
  const crop = document.getElementById("crop").value;
  const q = document.getElementById("quality").value;
  const m = Number(document.getElementById("month").value);
  const qty = Number(document.getElementById("qty").value) || 0;

  const fair = fairPrice(crop, m, q);
  const lo = Math.round(fair * 0.95 / 10) * 10, hi = Math.round(fair * 1.05 / 10) * 10;
  const next = fairPrice(crop, m + 1, q);
  const diff = (next - fair) / fair;

  const box = document.getElementById("result");
  box.innerHTML = "";
  function line(label, value, cls) {
    const d = document.createElement("div");
    d.className = "rline " + (cls || "");
    const a = document.createElement("span"); a.textContent = label;
    const b = document.createElement("b"); b.textContent = value;
    d.append(a, b);
    box.appendChild(d);
  }
  line(t("p_fair"), "₹" + fair, "big");
  line(t("p_range"), "₹" + lo + " – ₹" + hi);
  line(t("p_best"), bestMandiFor(crop));
  if (qty > 0) line(t("p_total"), "₹" + (fair * qty).toLocaleString("en-IN"));

  const tip = document.createElement("div");
  tip.className = "notice";
  tip.textContent = diff > 0.02 ? "📈 " + t("p_up") : diff < -0.02 ? "📉 " + t("p_down") : "➖ " + t("p_flat");
  box.appendChild(tip);

  // 6-month bar forecast
  const h = document.createElement("h2");
  h.textContent = t("p_forecast");
  box.appendChild(h);
  const bars = document.createElement("div");
  bars.className = "bars";
  const vals = [];
  for (let i = 0; i < 6; i++) vals.push(fairPrice(crop, m + i, q));
  const max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
  vals.forEach(function (v, i) {
    const col = document.createElement("div");
    col.className = "bcol";
    const bar = document.createElement("div");
    bar.className = "bar" + (v === max ? " top" : "");
    bar.style.height = (30 + 70 * (v - min) / Math.max(1, max - min)) + "px";
    const val = document.createElement("small"); val.textContent = "₹" + v;
    const lab = document.createElement("small"); lab.textContent = monthName((m + i) % 12);
    col.append(val, bar, lab);
    bars.appendChild(col);
  });
  box.appendChild(bars);
}

window.onLang = function () { fillMonths(); predictNow(); };
document.getElementById("month").value = new Date().getMonth();