
let bestMandi = "";
let shareChoice = false;

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
  document.getElementById("otp").focus();
}

function verifyOtp() {
  if (document.getElementById("otp").value !== "1234") {
    document.getElementById("msg").textContent = t("err_otp");
    return;
  }

  const mobile = document.getElementById("mobile").value;
  localStorage.setItem("ks_current", mobile);
  localStorage.setItem("ks_role", "farmer");

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

  users[mobile] = {
    mobile: mobile,
    name: name,
    district: district,
    village: village
  };

  localStorage.setItem("ks_users", JSON.stringify(users));

  document.getElementById("step2").hidden = true;
  openCropScreen();
}

function openCropScreen() {
  localStorage.setItem("ks_role", "farmer");
  document.getElementById("step3").hidden = false;
  showMandi();
  renderMine();
}

function logout() {
  localStorage.removeItem("ks_current");
  location.reload();
}

function showMandi() {
  const user = currentUser();

  if (user) {
    document.getElementById("welcome").textContent =
      t("welcome") + " " + user.name + " 👋";
  }

  if (!document.getElementById("crop")) return;

  const crop = document.getElementById("crop").value;
  bestMandi = bestMandiFor(crop);

  const box = document.getElementById("mandibox");
  box.innerHTML = "";

  const title = document.createElement("div");
  title.textContent = t("mandi_label");
  box.appendChild(title);

  for (const name in mandis) {
    const line = document.createElement("div");
    line.textContent =
      (name === bestMandi ? "⭐ " : "") +
      name + ": ₹" + mandis[name][crop];

    box.appendChild(line);
  }

  const fair = fairPrice(crop, new Date().getMonth(), "B");
  const f = document.createElement("div");
  f.textContent = "✨ " + t("fair_tag") + ": ₹" + fair;
  box.appendChild(f);

  const best = mandis[bestMandi][crop];
  const price = Number(document.getElementById("price").value);

  if (price > 0) {
    const cmp = document.createElement("div");

    if (price > best) cmp.textContent = "👉 " + t("above");
    else if (price < best) cmp.textContent = "👉 " + t("below");
    else cmp.textContent = "👉 " + t("same");

    box.appendChild(cmp);

    const fv = document.createElement("div");
    fv.textContent =
      price > fair * 1.08
        ? t("fair_high")
        : price < fair * 0.92
          ? t("fair_low")
          : t("fair_ok");

    box.appendChild(fv);
  }

  document.getElementById("notice").textContent =
    "🔔 " + t("best_today") + " " + t("c_" + crop) +
    ": " + bestMandi + " (₹" + best + ")";

  const cb = document.getElementById("contactbox");

  cb.textContent = shareChoice
    ? "✅ " + t("shared") + " " + bestMandi +
      ": " + (user ? user.mobile : "")
    : t("contact_text") + " " + Object.keys(mandis).join(", ");

  document.getElementById("sharebtn").hidden = shareChoice;
}

function useFair() {
  const crop = document.getElementById("crop").value;

  document.getElementById("price").value =
    fairPrice(crop, new Date().getMonth(), "B");

  showMandi();
  toast("✨ ₹" + document.getElementById("price").value);
}

function shareNumber() {
  shareChoice = true;
  showMandi();
  toast("✅ " + t("share"));
}

function submitCrop() {
  const user = currentUser();
  const qty = Number(document.getElementById("qty").value);
  const price = Number(document.getElementById("price").value);

  if (!(qty > 0) || !(price > 0)) {
    document.getElementById("msg3").textContent = t("err_crop");
    return;
  }

  document.getElementById("msg3").textContent = "";

  const crop = document.getElementById("crop").value;
  const id = Date.now();
  const all = getListings();

  all.push({
    id: id,
    mobile: user.mobile,
    name: user.name,
    village: user.village,
    district: user.district,
    crop: crop,
    qty: qty,
    price: price,
    mandi: bestMandi,
    shared: shareChoice
  });

  saveListings(all);

  document.getElementById("summary").textContent =
    t("c_" + crop) + " · " + qty + " " +
    t("quintal") + " · ₹" + price + " / " + t("quintal");

  document.getElementById("ref").textContent =
    "KS" + Math.floor(10000 + Math.random() * 90000);

  document.getElementById("step3").hidden = true;
  document.getElementById("step4").hidden = false;

  window.scrollTo(0, 0);
}

/* DISPLAY FARMER'S LISTINGS AND DELETE OPTION */

function renderMine() {
  const user = currentUser();
  const box = document.getElementById("mylist");

  if (!user || !box) return;

  box.innerHTML = "";

  const mine = getListings().filter(function (l) {
    return l.mobile === user.mobile;
  });

  if (mine.length === 0) {
    box.textContent = t("f_none");
    return;
  }

  mine.forEach(function (l) {
    const card = document.createElement("div");
    card.className = "card";

    const h = document.createElement("h2");
    h.textContent = t("c_" + l.crop);

    const p = document.createElement("p");
    p.textContent =
      l.qty + " " + t("quintal") +
      " · ₹" + l.price + " / " + t("quintal");

    const del = document.createElement("button");
    del.className = "link";
    del.textContent = "🗑 " + t("f_delete");

    del.onclick = function () {
      const confirmDelete = confirm(
        "Are you sure you want to delete this crop listing?"
      );

      if (!confirmDelete) return;

      const updatedListings = getListings().filter(function (x) {
        return x.id !== l.id;
      });

      saveListings(updatedListings);
      renderMine();
      toast(t("f_removed"));
    };

    card.append(h, p, del);
    box.appendChild(card);
  });
}

window.onLang = function () {
  showMandi();
  renderMine();
};

if (currentUser()) {
  document.getElementById("step1").hidden = true;
  openCropScreen();
}
