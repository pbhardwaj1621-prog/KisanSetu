let view = new URLSearchParams(location.search).get("as") || localStorage.getItem("ks_role") || "farmer";
const KEYS = { farmer: ["ks_users", "ks_current"], buyer: ["ks_buyers", "ks_buyer_current"] };

function userOf(r) { return readJSON(KEYS[r][0], {})[localStorage.getItem(KEYS[r][1])]; }
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function field(id, label, value, mic) {
  const wrap = document.createDocumentFragment();
  const l = el("label", "", label); l.htmlFor = id;
  const i = el("input"); i.id = id; i.value = value || "";
  wrap.appendChild(l);
  if (mic) { const r = el("div", "row"); const b = el("button", "mic", "🎤"); b.type = "button"; b.dataset.mic = id; b.onclick = function () { speak(id); }; r.append(i, b); wrap.appendChild(r); }
  else wrap.appendChild(i);
  return wrap;
}

function show(r) {
  view = r;
  ["farmer", "buyer"].forEach(function (x) { document.getElementById("tab-" + x).classList.toggle("on", x === r); });
  const out = document.getElementById("out");
  out.innerHTML = "";
  const me = userOf(r);
  if (!me) {
    const c = el("div", "card");
    c.append(el("p", "", t("pr_login")));
    const a = el("a", "bada" + (r === "buyer" ? " khareedar" : ""), t("pr_go")); a.href = r + ".html";
    c.appendChild(a); out.appendChild(c); return;
  }
  const listings = getListings(), chats = getChats();
  let s1, s2, s3;
  const mineL = listings.filter(function (l) { return l.mobile === me.mobile; });
  if (r === "farmer") {
    const ids = mineL.map(function (l) { return l.id; });
    const th = Object.values(chats).filter(function (c) { return ids.indexOf(c.listing) > -1; });
    s1 = [mineL.length, t("pr_listings")];
    s2 = [th.length, t("pr_chats")];
    s3 = [th.filter(function (c) { return c.deal; }).length, t("pr_deals")];
  } else {
    const th = Object.values(chats).filter(function (c) { return c.buyer === me.mobile; });
    s1 = [th.length, t("pr_chats")];
    s2 = [th.filter(function (c) { return c.deal; }).length, t("pr_deals")];
    s3 = [listings.filter(function (l) { return l.mandi === me.mandi; }).length, t("pr_area")];
  }

  const top = el("div", "pcard " + r);
  top.appendChild(Object.assign(el("div", "big-av notranslate"), { textContent: me.name.charAt(0).toUpperCase() }));
  const info = el("div");
  info.append(el("h1", "notranslate", me.name), el("span", "role", t("pr_" + r)),
    el("p", "notranslate", "📞 " + me.mobile),
    el("p", "notranslate", r === "farmer" ? "📍 " + me.village + ", " + me.district : "📍 " + me.mandi));
  top.appendChild(info);
  out.appendChild(top);

  const st = el("div", "stats");
  [s1, s2, s3].forEach(function (s) { const d = el("div", "stat"); d.append(el("b", "", s[0]), el("small", "", s[1])); st.appendChild(d); });
  out.appendChild(st);

  const form = el("div", "card");
  form.appendChild(el("h2", "", t("pr_edit")));
  form.appendChild(field("e_name", t("name"), me.name, true));
  if (r === "farmer") {
    form.appendChild(field("e_district", t("district"), me.district, true));
    form.appendChild(field("e_village", t("village"), me.village, true));
  } else {
    const l = el("label", "", t("b_mandi")); l.htmlFor = "e_mandi";
    const sel = el("select"); sel.id = "e_mandi";
    Object.keys(mandis).forEach(function (m) { const o = el("option", "", m); o.value = m; sel.appendChild(o); });
    sel.value = me.mandi; form.append(l, sel);
  }
  const save = el("button", "bada" + (r === "buyer" ? " khareedar" : ""), t("pr_save"));
  save.onclick = function () { saveProfile(r, me); };
  form.append(save, el("p", "msg"));
  out.appendChild(form);

  const out2 = el("button", "bada ghost", t("pr_logout"));
  out2.onclick = function () { localStorage.removeItem(KEYS[r][1]); location.href = "index.html"; };
  out.appendChild(out2);
}

function saveProfile(r, me) {
  const name = document.getElementById("e_name").value.trim();
  const msg = document.querySelector("#out .msg");
  if (!name) { msg.textContent = t("err_fill"); return; }
  const all = readJSON(KEYS[r][0], {});
  me.name = name;
  if (r === "farmer") {
    me.district = document.getElementById("e_district").value.trim();
    me.village = document.getElementById("e_village").value.trim();
    if (!me.district || !me.village) { msg.textContent = t("err_fill"); return; }
    saveListings(getListings().map(function (l) {      // keep listings in sync with the profile
      if (l.mobile === me.mobile) { l.name = me.name; l.district = me.district; l.village = me.village; }
      return l;
    }));
  } else {
    me.mandi = document.getElementById("e_mandi").value;
  }
  all[me.mobile] = me;
  localStorage.setItem(KEYS[r][0], JSON.stringify(all));
  toast("✅ " + t("pr_saved"));
  show(r);
}

window.onLang = function () { show(view); };
show(view);