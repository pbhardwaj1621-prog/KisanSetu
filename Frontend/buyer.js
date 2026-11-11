function getBuyers() {
  return JSON.parse(localStorage.getItem("ks_buyers") || "{}");
}

function currentBuyer() {
  return getBuyers()[localStorage.getItem("ks_buyer_current")];
}

function sendOtp() {
  const mobile = document.getElementById("mobile").value;
  if (mobile.length !== 10 || isNaN(mobile)) {
    document.getElementById("msg").textContent = t("err_mobile");
    return;
  }
  document.getElementById("msg").textContent = "";
  document.getElementById("otpbox").hidden = false;
}

function verifyOtp() {
  if (document.getElementById("otp").value !== "1234") {
    document.getElementById("msg").textContent = t("err_otp");
    return;
  }
  const mobile = document.getElementById("mobile").value;
  localStorage.setItem("ks_buyer_current", mobile);
  document.getElementById("step1").hidden = true;
  if (getBuyers()[mobile]) {
    openList();
  } else {
    document.getElementById("step2").hidden = false;
  }
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
  const all = JSON.parse(localStorage.getItem("ks_listings") || "[]");
  const box = document.getElementById("list");
  box.innerHTML = "";
  let count = 0;

  all.forEach(function (item) {
    if (filter !== "all" && item.crop !== filter) return;
    count++;

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h2");
    title.textContent = t("c_" + item.crop);

    const info = document.createElement("p");
    info.textContent = item.qty + " " + t("quintal") + " · ₹" + item.price + " / " + t("quintal");

    const who = document.createElement("p");
    who.textContent = "👤 " + item.name + " · 📍 " + item.village + ", " + item.district;

    card.append(title, info, who);

    if (item.mandi === buyer.mandi) {
      const tag = document.createElement("p");
      tag.textContent = t("b_area");
      card.appendChild(tag);
    }

    if (item.shared) {
      const call = document.createElement("a");
      call.className = "bada";
      call.href = "tel:" + item.mobile;
      call.textContent = t("b_call") + " " + item.mobile;
      card.appendChild(call);
    } else {
      const no = document.createElement("p");
      no.textContent = t("b_nonum");
      card.appendChild(no);
    }

    box.appendChild(card);
  });

  if (count === 0) {
    box.textContent = t("b_none");
  }
}

if (currentBuyer()) {
  document.getElementById("step1").hidden = true;
  openList();
}
