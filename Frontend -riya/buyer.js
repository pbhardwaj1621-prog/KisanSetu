function getBuyers() { return readJSON("ks_buyers", {}); }
function currentBuyer() { return getBuyers()[localStorage.getItem("ks_buyer_current")]; }

function sendOtp() {
  const mobile = document.getElementById("mobile").value;
  if (!/^\d{10}$/.test(mobile)) {
    document.getElementById("msg").textContent = t("err_mobile");
    return;
  }
  document.getElementById("msg").textContent = "";
  document.getElementById("otpbox").hidden = false;
  document.getElementById("otp").focus();
}

function verifyOtp() {
  if (document.getElementById("otp").value !== "1234") {
    document.getElementById("msg").textContent = t("err_otp");
    return;
  }
  const mobile = document.getElementById("mobile").value;
  localStorage.setItem("ks_buyer_current", mobile);
  localStorage.setItem("ks_role", "buyer");
  document.getElementById("step1").hidden = true;
  if (getBuyers()[mobile]) openList();
  else document.getElementById("step2").hidden = false;
}

function saveProfile() {
  const name = document.getElementById("name").value.trim();
  const mandi = document.getElementById("mandi").value;
  if (!name) {
    document.getElementById("msg2").textContent = t("err_fill");
    return;
  }
  const buyers = getBuyers();
  const mobile = localStorage.getItem("ks_buyer_current");
  buyers[mobile] = { mobile: mobile, name: name, mandi: mandi };
  localStorage.setItem("ks_buyers", JSON.stringify(buyers));
  document.getElementById("step2").hidden = true;
  openList();
}

function openList() {
  localStorage.setItem("ks_role", "buyer");
  document.getElementById("step3").hidden = false;
  renderList();
}

function logout() {
  localStorage.removeItem("ks_buyer_current");
  location.reload();
}

function renderList() {
  const buyer = currentBuyer();
  if (!buyer) return;
  document.getElementById("welcome").textContent = t("welcome") + " " + buyer.name + " 👋";

  const filter = document.getElementById("filter").value;
  const sort = document.getElementById("sort").value;
  let all = getListings().filter(function (i) { return filter === "all" || i.crop === filter; });
  if (sort === "low") all.sort(function (a, b) { return a.price - b.price; });
  else if (sort === "high") all.sort(function (a, b) { return b.price - a.price; });
  else all.sort(function (a, b) { return b.id - a.id; });

  const box = document.getElementById("list");
  box.innerHTML = "";
  if (all.length === 0) { box.textContent = t("b_none"); return; }

  const month = new Date().getMonth();
  all.forEach(function (item) {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h2");
    title.textContent = cropIcon[item.crop] + " " + t("c_" + item.crop);

    const info = document.createElement("p");
    info.textContent = item.qty + " " + t("quintal") + " · ₹" + item.price + " / " + t("quintal");

    const fair = fairPrice(item.crop, month, "B");
    const badge = document.createElement("span");
    badge.className = "badge " + (item.price > fair * 1.08 ? "hi" : item.price < fair * 0.92 ? "lo" : "ok");
    badge.textContent = (item.price > fair * 1.08 ? t("fair_high") : item.price < fair * 0.92 ? t("fair_low") : t("fair_ok")) + " (₹" + fair + ")";

    const who = document.createElement("p");
    who.textContent = "👤 " + item.name + " · 📍 " + item.village + ", " + item.district;

    card.append(title, info, badge, who);

    if (item.mandi === buyer.mandi) {
      const tag = document.createElement("p");
      tag.textContent = t("b_area");
      card.appendChild(tag);
    }

    const chat = document.createElement("a");
    chat.className = "bada khareedar";
    chat.href = "chat.html?as=buyer&l=" + item.id;
    chat.textContent = t("b_chat");
    card.appendChild(chat);

    if (item.shared) {
      const call = document.createElement("a");
      call.className = "bada ghost";
      call.href = "tel:" + item.mobile;
      call.textContent = t("b_call") + " " + item.mobile;
      card.appendChild(call);
    } else {
      const no = document.createElement("p");
      no.className = "hint";
      no.textContent = t("b_nonum");
      card.appendChild(no);
    }
    box.appendChild(card);
  });
}

window.onLang = renderList;

if (currentBuyer()) {
  document.getElementById("step1").hidden = true;
  openList();
}