const params = new URLSearchParams(location.search);
const role = params.get("as") || localStorage.getItem("ks_role") || "buyer";
let me = null, threadKey = params.get("k") || null;

(function init() {
  if (role === "farmer") me = readJSON("ks_users", {})[localStorage.getItem("ks_current")];
  else me = readJSON("ks_buyers", {})[localStorage.getItem("ks_buyer_current")];
  if (!me) {
    document.getElementById("threads").innerHTML =
      '<p class="msg">' + t("ch_login") + '</p><a class="bada" href="' + (role === "farmer" ? "farmer" : "buyer") + '.html">OK</a>';
    return;
  }
  // buyer arriving from a listing: create the thread if needed
  const l = params.get("l");
  if (l && role === "buyer") {
    threadKey = l + "_" + me.mobile;
    const chats = getChats();
    if (!chats[threadKey]) {
      chats[threadKey] = { listing: Number(l), buyer: me.mobile, buyerName: me.name, msgs: [], deal: null };
      saveChats(chats);
    }
  }
  render();
})();

function listingOf(th) { return getListings().filter(function (x) { return x.id === th.listing; })[0]; }
function mine(th) {
  const lst = listingOf(th);
  return role === "buyer" ? th.buyer === me.mobile : (lst && lst.mobile === me.mobile);
}

function render() { if (!me) return; threadKey && getChats()[threadKey] ? showRoom() : showInbox(); }

function showInbox() {
  document.getElementById("room").hidden = true;
  document.getElementById("inbox").hidden = false;
  const box = document.getElementById("threads");
  box.innerHTML = "";
  const chats = getChats();
  const keys = Object.keys(chats).filter(function (k) { return mine(chats[k]); });
  if (!keys.length) { box.textContent = t("ch_none"); return; }
  keys.forEach(function (k) {
    const th = chats[k], lst = listingOf(th);
    const card = document.createElement("div");
    card.className = "card thread";
    const h = document.createElement("h2");
    h.textContent = (lst ? cropIcon[lst.crop] + " " + t("c_" + lst.crop) : "—") + " · " + (role === "buyer" && lst ? lst.name : th.buyerName);
    const last = th.msgs[th.msgs.length - 1];
    const p = document.createElement("p");
    p.textContent = th.deal ? t("ch_deal") + " ₹" + th.deal : last ? (last.offer ? t("ch_offered") + " ₹" + last.offer : last.text) : "…";
    const b = document.createElement("button");
    b.className = "bada small";
    b.textContent = t("ch_open");
    b.onclick = function () { threadKey = k; showRoom(); };
    const av = document.createElement("span"); av.className = "cav"; av.textContent = lst ? cropIcon[lst.crop] : "💬";
    const mid = document.createElement("div"); mid.className = "tmid"; mid.append(h, p);
    if (th.deal) { const bd = document.createElement("span"); bd.className = "badge ok"; bd.textContent = "🤝 " + t("ch_deal"); mid.appendChild(bd); }
    card.append(av, mid, b);
    box.appendChild(card);
  });
}

function backToInbox() { threadKey = null; history.replaceState(null, "", "chat.html?as=" + role); showInbox(); }

function showRoom() {
  document.getElementById("inbox").hidden = true;
  document.getElementById("room").hidden = false;
  const th = getChats()[threadKey];
  if (!th) { threadKey = null; showInbox(); return; }
  const lst = listingOf(th);
  const rh = document.getElementById("roomhead"); rh.innerHTML = "";
  if (lst) {
    const av = document.createElement("span"); av.className = "cav"; av.textContent = cropIcon[lst.crop];
    const tx = document.createElement("div");
    const b = document.createElement("b"); b.textContent = t("c_" + lst.crop) + " · " + (role === "buyer" ? lst.name : th.buyerName);
    const sm = document.createElement("small"); sm.textContent = lst.qty + " " + t("quintal") + " · ₹" + lst.price + " / " + t("quintal");
    tx.append(b, sm); rh.append(av, tx);
  }
  // quick one-tap questions and the offer box are hidden once a deal is final
  document.getElementById("offerrow").hidden = !!th.deal;
  document.getElementById("text").parentNode.hidden = !!th.deal;
  document.getElementById("sendbtn").hidden = !!th.deal;
  const quick = document.getElementById("quick");
  quick.innerHTML = "";
  if (!th.deal) ["ch_q1", "ch_q2", "ch_q3"].forEach(function (k) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = t(k);
    b.onclick = function () { push({ text: t(k) }); };
    quick.appendChild(b);
  });
  const offerEl = document.getElementById("offer");
  if (lst && !offerEl.value) offerEl.placeholder = "₹" + lst.price;

  const box = document.getElementById("msgs");
  box.innerHTML = "";
  th.msgs.forEach(function (m, i) {
    const d = document.createElement("div");
    d.className = "bubble " + (m.from === role ? "me" : "them") + (m.offer ? " offer" : "");
    d.textContent = m.offer ? t("ch_offered") + " ₹" + m.offer : m.text;
    if (m.time) { const tm = document.createElement("small"); tm.className = "bt"; tm.textContent = new Date(m.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); d.appendChild(tm); }
    box.appendChild(d);
    // the other side can accept an open offer (only the latest one, only before a deal)
    if (m.offer && m.from !== role && !th.deal && i === th.msgs.length - 1) {
      const a = document.createElement("button");
      a.className = "bada";
      a.textContent = t("ch_accept");
      a.onclick = function () { acceptOffer(m.offer); };
      box.appendChild(a);
    }
  });
  if (th.deal) {
    const d = document.createElement("div");
    d.className = "deal";
    d.textContent = t("ch_deal") + " ₹" + th.deal + " / " + t("quintal");
    box.appendChild(d);
    const closed = document.createElement("div");
    closed.className = "hint"; closed.textContent = t("ch_closed");
    box.appendChild(closed);
    confettiOnce(threadKey);
  }
  box.scrollTop = box.scrollHeight;
}

function confettiOnce(k) {       // celebrate a new deal only once per chat
  if (sessionStorage.getItem("ks_cf_" + k)) return;
  sessionStorage.setItem("ks_cf_" + k, "1");
  confetti();
}

function push(msg) {
  const chats = getChats();
  if (!chats[threadKey] || chats[threadKey].deal) return;     // chat closed or crop removed
  chats[threadKey].msgs.push(Object.assign({ from: role, time: Date.now() }, msg));
  saveChats(chats);
  showRoom();
}
function sendText() {
  const el = document.getElementById("text");
  const v = el.value.trim();
  if (!v) { document.getElementById("cmsg").textContent = t("ch_err"); return; }
  document.getElementById("cmsg").textContent = "";
  el.value = "";
  push({ text: v });
}
function sendOffer() {
  const el = document.getElementById("offer");
  const v = Number(el.value);
  if (!(v > 0) || v > 1000000) { document.getElementById("cmsg").textContent = t("ch_err"); return; }
  document.getElementById("cmsg").textContent = "";
  el.value = "";
  push({ offer: v });
}
function acceptOffer(price) {
  const chats = getChats();
  if (!chats[threadKey] || chats[threadKey].deal) return;
  chats[threadKey].deal = price;
  saveChats(chats);
  showRoom();
  toast(t("ch_deal") + " ₹" + price);
}

// live update when the other person (other tab/browser window) sends something
window.addEventListener("storage", function (e) { if (e.key === "ks_chats") render(); });
window.onLang = render;