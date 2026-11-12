/* Shared data + helpers. Replace these with real API calls when the backend is ready. */
const mandis = {
  "Mathura": { wheat: 2400, rice: 3800, tomato: 1800, onion: 1700, potato: 1300 },
  "Chhata":  { wheat: 2450, rice: 3750, tomato: 1900, onion: 1650, potato: 1350 },
  "Kosi":    { wheat: 2380, rice: 3900, tomato: 1750, onion: 1800, potato: 1280 },
  "Agra":    { wheat: 2500, rice: 3850, tomato: 2000, onion: 1750, potato: 1400 }
};

// seasonal price factor per month (Jan..Dec): low at harvest, high off-season
const season = {
  wheat:  [1.04,1.03,1.00,0.96,0.96,0.98,1.00,1.02,1.03,1.04,1.05,1.05],
  rice:   [1.04,1.05,1.05,1.04,1.03,1.02,1.00,0.99,0.98,0.95,0.95,1.00],
  tomato: [0.90,0.90,0.95,1.05,1.15,1.20,1.15,1.05,0.95,0.90,0.90,0.90],
  onion:  [0.95,0.90,0.90,0.95,1.00,1.05,1.10,1.15,1.20,1.10,1.00,0.95],
  potato: [0.95,0.90,0.90,0.95,1.05,1.10,1.10,1.10,1.05,1.00,0.95,0.95]
};
const qualityFactor = { A: 1.05, B: 1.0, C: 0.92 };

function avgMandi(crop) {
  let s = 0, n = 0;
  for (const m in mandis) { s += mandis[m][crop]; n++; }
  return s / n;
}
function bestMandiFor(crop) {
  let best = "";
  for (const m in mandis) if (best === "" || mandis[m][crop] > mandis[best][crop]) best = m;
  return best;
}
// fair price = average mandi price x season factor x quality factor
function fairPrice(crop, monthIdx, quality) {
  const p = avgMandi(crop) * season[crop][monthIdx % 12] * (qualityFactor[quality] || 1);
  return Math.round(p / 10) * 10;
}

function getListings() { return JSON.parse(localStorage.getItem("ks_listings") || "[]"); }
function saveListings(a) { localStorage.setItem("ks_listings", JSON.stringify(a)); }
function getChats() { return JSON.parse(localStorage.getItem("ks_chats") || "{}"); }
function saveChats(c) { localStorage.setItem("ks_chats", JSON.stringify(c)); }

function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.className = "show";
  clearTimeout(el._t);
  el._t = setTimeout(function () { el.className = ""; }, 2200);
}
function busy(btn, ms, fn) {            // small "loading" effect on buttons
  const old = btn.textContent;
  btn.disabled = true; btn.textContent = "⏳";
  setTimeout(function () { btn.disabled = false; btn.textContent = old; fn(); }, ms);
}