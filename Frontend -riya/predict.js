const NS = "http://www.w3.org/2000/svg";
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
    o.value = i; o.textContent = monthName(i); sel.appendChild(o);
  }
  sel.value = keep;
}
function E(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function S(tag, attrs, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  return e;
}

function chart(vals, m, best) {
  const W = 340, H = 170, L = 24, R = 24, T = 34, B = 30;
  const max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
  const X = function (i) { return L + i * (W - L - R) / (vals.length - 1); };
  const Y = function (v) { return T + (H - T - B) * (1 - (v - min) / Math.max(1, max - min)); };
  const svg = S("svg", { viewBox: "0 0 " + W + " " + H, class: "chart", role: "img" });
  const defs = S("defs", {}), g = S("linearGradient", { id: "gr", x1: 0, y1: 0, x2: 0, y2: 1 });
  g.append(S("stop", { offset: "0", "stop-color": "#2f7d4a", "stop-opacity": ".35" }), S("stop", { offset: "1", "stop-color": "#2f7d4a", "stop-opacity": "0" }));
  defs.appendChild(g); svg.appendChild(defs);
  const pts = vals.map(function (v, i) { return X(i) + "," + Y(v); });
  svg.appendChild(S("polygon", { points: X(0) + "," + (H - B) + " " + pts.join(" ") + " " + X(vals.length - 1) + "," + (H - B), fill: "url(#gr)" }));
  svg.appendChild(S("polyline", { points: pts.join(" "), fill: "none", stroke: "#2f7d4a", "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round" }));
  vals.forEach(function (v, i) {
    const top = i === best;
    svg.appendChild(S("circle", { cx: X(i), cy: Y(v), r: top ? 7 : 4.5, fill: top ? "#f2a516" : "#fff", stroke: "#2f7d4a", "stroke-width": 2.5 }));
    svg.appendChild(S("text", { x: X(i), y: Y(v) - 12, "text-anchor": "middle", "font-size": 11, "font-weight": top ? 800 : 600, fill: "#10261c" }, "₹" + v));
    svg.appendChild(S("text", { x: X(i), y: H - 8, "text-anchor": "middle", "font-size": 11, fill: "#53685b" }, monthName((m + i) % 12)));
  });
  return svg;
}

function predictNow() {
  const crop = document.getElementById("crop").value;
  const q = document.getElementById("quality").value;
  const m = Number(document.getElementById("month").value);
  const qty = Number(document.getElementById("qty").value) || 0;

  const fair = fairPrice(crop, m, q);
  const lo = Math.round(fair * 0.95 / 10) * 10, hi = Math.round(fair * 1.05 / 10) * 10;
  const diff = (fairPrice(crop, m + 1, q) - fair) / fair;
  const vals = [];
  for (let i = 0; i < 6; i++) vals.push(fairPrice(crop, m + i, q));
  const bi = vals.indexOf(Math.max.apply(null, vals));

  const box = document.getElementById("result");
  box.innerHTML = "";

  // hero price card
  const hero = E("div", "phero");
  const trend = diff > 0.02 ? ["up", "📈 " + t("p_up")] : diff < -0.02 ? ["down", "📉 " + t("p_down")] : ["flat", "➖ " + t("p_flat")];
  const top = E("div", "ptop");
  top.append(E("span", "pico", cropIcon[crop]), E("span", "", t("c_" + crop) + " · " + t("p_fair")));
  const price = E("div", "pprice"); price.append(E("b", "", "₹" + fair), E("small", "", " / " + t("quintal")));
  hero.append(top, price, E("span", "ptrend " + trend[0], trend[1]));
  box.appendChild(hero);

  // stat tiles
  const tiles = E("div", "stats");
  [[t("p_range"), "₹" + lo + "–" + hi], [t("p_best"), bestMandiFor(crop)], [t("p_total"), qty > 0 ? "₹" + (fair * qty).toLocaleString("en-IN") : "—"]]
    .forEach(function (x) { const d = E("div", "stat"); d.append(E("b", "sm", x[1]), E("small", "", x[0])); tiles.appendChild(d); });
  box.appendChild(tiles);

  // sell-now-or-wait insight
  const tip = E("div", "insight " + (bi === 0 ? "now" : "wait"));
  tip.append(E("span", "", bi === 0 ? "✅" : "⏳"),
    E("div", "", ""));
  tip.lastChild.append(E("b", "", bi === 0 ? t("p_bestnow") : t("p_wait")),
    E("small", "", t("p_bestmonth") + ": " + monthName((m + bi) % 12) + " · ₹" + vals[bi]));
  box.appendChild(tip);

  // forecast chart
  const c1 = E("div", "card"); c1.appendChild(E("h2", "", t("p_forecast"))); c1.appendChild(chart(vals, m, bi));
  box.appendChild(c1);

  // mandi comparison
  const c2 = E("div", "card"); c2.appendChild(E("h2", "", t("p_mandis")));
  const best = bestMandiFor(crop), mx = mandis[best][crop];
  Object.keys(mandis).sort(function (a, b) { return mandis[b][crop] - mandis[a][crop]; }).forEach(function (n) {
    const r = E("div", "mrow"), v = mandis[n][crop];
    const bar = E("div", "mbar" + (n === best ? " top" : "")); bar.style.width = (45 + 55 * v / mx) + "%";
    bar.appendChild(E("span", "", (n === best ? "⭐ " : "") + n));
    r.append(bar, E("b", "", "₹" + v)); c2.appendChild(r);
  });
  box.appendChild(c2);
}

window.onLang = function () { fillMonths(); refreshChips(); predictNow(); };
document.getElementById("month").value = new Date().getMonth();