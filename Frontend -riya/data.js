/* Shared data + helpers. Replace these with real API calls when the backend is ready. */
const mandis = {
  "Mathura": { wheat: 2400, rice: 3800, tomato: 1800, onion: 1700, potato: 1300 },
  "Chhata":  { wheat: 2450, rice: 3750, tomato: 1900, onion: 1650, potato: 1350 },
  "Kosi":    { wheat: 2380, rice: 3900, tomato: 1750, onion: 1800, potato: 1280 },
  "Agra":    { wheat: 2500, rice: 3850, tomato: 2000, onion: 1750, potato: 1400 }
};
const cropIcon = { all: "🧺", wheat: "🌾", rice: "🍚", tomato: "🍅", onion: "🧅", potato: "🥔" };

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

/* ---- storage (safe: a broken/empty value never crashes the page) ---- */
function readJSON(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; }
  catch (e) { return fallback; }
}
function getListings() { return readJSON("ks_listings", []); }
function saveListings(a) { localStorage.setItem("ks_listings", JSON.stringify(a)); }
function getChats() { return readJSON("ks_chats", {}); }
function saveChats(c) { localStorage.setItem("ks_chats", JSON.stringify(c)); }

/* ---- small UI helpers ---- */
function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.className = "show";
  clearTimeout(el._t);
  el._t = setTimeout(function () { el.className = ""; }, 2400);
}
function busy(btn, ms, fn) {            // small "loading" effect on buttons
  const old = btn.textContent;
  btn.disabled = true; btn.textContent = "⏳";
  setTimeout(function () { btn.disabled = false; btn.textContent = old; fn(); }, ms);
}

// Pop-up asking "are you sure?"  (used before deleting)
function confirmBox(title, text, yesLabel, noLabel, onYes) {
  const ov = document.createElement("div");
  ov.className = "overlay";
  const box = document.createElement("div");
  box.className = "dialog";
  box.setAttribute("role", "alertdialog");
  const h = document.createElement("h2"); h.textContent = title;
  const p = document.createElement("p"); p.textContent = text;
  const yes = document.createElement("button");
  yes.className = "bada danger"; yes.textContent = yesLabel;
  const no = document.createElement("button");
  no.className = "bada ghost"; no.textContent = noLabel;
  function close() { document.removeEventListener("keydown", onKey); ov.remove(); }
  function onKey(e) { if (e.key === "Escape") close(); }
  yes.onclick = function () { close(); onYes(); };
  no.onclick = close;
  ov.onclick = function (e) { if (e.target === ov) close(); };
  document.addEventListener("keydown", onKey);
  box.append(h, p, yes, no);
  ov.appendChild(box);
  document.body.appendChild(ov);
  no.focus();
}

// Little celebration when a crop is listed
function confetti() {
  const colors = ["#2f6b3a", "#e0b800", "#1b5e7a", "#c23b22", "#8fbf95"];
  for (let i = 0; i < 36; i++) {
    const s = document.createElement("span");
    s.className = "confetti";
    s.style.left = Math.random() * 100 + "vw";
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = Math.random() * 0.4 + "s";
    s.style.animationDuration = 1.4 + Math.random() * 1.2 + "s";
    document.body.appendChild(s);
    setTimeout(function () { s.remove(); }, 3000);
  }
}

// Turns any <select data-chips> into big tappable crop buttons (the select stays as the real value)
function refreshChips() {
  document.querySelectorAll("select[data-chips]").forEach(function (sel) {
    if (!sel._wrap) {
      sel.hidden = true;
      sel._wrap = document.createElement("div");
      sel._wrap.className = "chips";
      sel.parentNode.insertBefore(sel._wrap, sel.nextSibling);
    }
    const wrap = sel._wrap;
    wrap.innerHTML = "";
    Array.prototype.forEach.call(sel.options, function (o) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (o.value === sel.value ? " on" : "");
      b.setAttribute("aria-pressed", o.value === sel.value);
      b.textContent = (cropIcon[o.value] || "") + " " + o.textContent;
      b.onclick = function () {
        sel.value = o.value;
        sel.dispatchEvent(new Event("change"));
        refreshChips();
      };
      wrap.appendChild(b);
    });
  });
}

// Number boxes only accept digits (data-num="int") or digits + one dot (data-num="dec")
document.addEventListener("input", function (e) {
  const el = e.target, kind = el.dataset && el.dataset.num;
  if (!kind) return;
  let v = el.value.replace(kind === "dec" ? /[^\d.]/g : /\D/g, "");
  if (kind === "dec") { const p = v.split("."); if (p.length > 2) v = p[0] + "." + p.slice(1).join(""); }
  if (v !== el.value) el.value = v;
});