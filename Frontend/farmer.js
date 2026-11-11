const mandis = {
  "Mathura": { wheat: 2400, rice: 3800, tomato: 1800, onion: 1700, potato: 1300 },
  "Chhata":  { wheat: 2450, rice: 3750, tomato: 1900, onion: 1650, potato: 1350 },
  "Kosi":    { wheat: 2380, rice: 3900, tomato: 1750, onion: 1800, potato: 1280 },
  "Agra":    { wheat: 2500, rice: 3850, tomato: 2000, onion: 1750, potato: 1400 }
};

let bestMandi = "";

function getUsers() {
  return JSON.parse(localStorage.getItem("ks_users") || "{}");
}

function currentUser() {
  return getUsers()[localStorage.getItem("ks_current")];
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
  localStorage.setItem("ks_current", mobile);
  document.getElementById("step1").hidden = true;
  if (getUsers()[mobile]) {
    openCropScreen();
  } else {
    document.getElementById("step2").hidden = false;
  }
}

function saveProfile() {
  const name = document.getElementById("name").value.trim();
  const district = document.getElementById("district").value.trim();
  const village = document.getElementById("village").value.trim();
  if (!name || !district || !village) {
    document.getElementById("msg2").textContent = t("err_fill");
    return;
  }
  const users = getUsers();
  const mobile = localStorage.getItem("ks_current");
  users[mobile] = { mobile: mobile, name: name, district: district, village: village };
  localStorage.setItem("ks_users", JSON.stringify(users));
  document.getElementById("step2").hidden = true;
  openCropScreen();
}

function openCropScreen() {
  document.getElementById("step3").hidden = false;
  showMandi();
}

function logout() {
  localStorage.removeItem("ks_current");
  location.reload();
}

function showMandi() {
  const user = currentUser();
  if (user) {
    document.getElementById("welcome").textContent = t("welcome") + " " + user.name + " 👋";
  }

  const crop = document.getElementById("crop").value;
  bestMandi = "";
  for (const name in mandis) {
    if (bestMandi === "" || mandis[name][crop] > mandis[bestMandi][crop]) {
      bestMandi = name;
    }
  }

  const box = document.getElementById("mandibox");
  box.innerHTML = "";
  const title = document.createElement("div");
  title.textContent = t("mandi_label");
  box.appendChild(title);
  for (const name in mandis) {
    const line = document.createElement("div");
    line.textContent = (name === bestMandi ? "⭐ " : "") + name + ": ₹" + mandis[name][crop];
    box.appendChild(line);
  }

  const best = mandis[bestMandi][crop];
  const price = Number(document.getElementById("price").value);
  if (price > 0) {
    const cmp = document.createElement("div");
    if (price > best) cmp.textContent = "👉 " + t("above");
    else if (price < best) cmp.textContent = "👉 " + t("below");
    else cmp.textContent = "👉 " + t("same");
    box.appendChild(cmp);
  }

  document.getElementById("notice").textContent =
    "🔔 " + t("best_today") + " " + t("c_" + crop) + ": " + bestMandi + " (₹" + best + ")";
}

function submitCrop() {
    const user = currentUser();
    const all = JSON.parse(localStorage.getItem("ks_listings") || "[]");
    const last = localStorage.getItem("ks_last");
    all.forEach(function (l) { if (String(l.id) === last) l.shared = true; });
    localStorage.setItem("ks_listings", JSON.stringify(all));
    
  all.push({
    id: id, mobile: user.mobile, name: user.name, village: user.village,
    district: user.district, crop: document.getElementById("crop").value,
    qty: qty, price: price, mandi: bestMandi, shared: false
  });
  localStorage.setItem("ks_listings", JSON.stringify(all));
  localStorage.setItem("ks_last", id);
  const qty = Number(document.getElementById("qty").value);
  const price = Number(document.getElementById("price").value);
  if (!(qty > 0) || !(price > 0)) {
    document.getElementById("msg3").textContent = t("err_crop");
    return;
  }
  const cropName = document.getElementById("crop").selectedOptions[0].textContent;
  document.getElementById("summary").textContent =
    cropName + " · " + qty + " " + t("quintal") + " · ₹" + price + " / " + t("quintal");
  document.getElementById("ref").textContent = "KS" + Math.floor(10000 + Math.random() * 90000);
  document.getElementById("contactbox").textContent = t("contact_text") + " " + bestMandi;
  document.getElementById("step3").hidden = true;
  document.getElementById("step4").hidden = false;
}

function shareNumber() {
  const user = currentUser();
  document.getElementById("contactbox").textContent =
    "✅ " + t("shared") + " " + bestMandi + ": " + user.mobile;
  document.getElementById("sharebtn").hidden = true;
}

if (currentUser()) {
  document.getElementById("step1").hidden = true;
  openCropScreen();
}
  