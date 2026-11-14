/* UI layer: profile link in nav, avatar in header, active tab. (Translations live in lang.js.) */

(function () {
  function rd(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  const role = localStorage.getItem("ks_role") || "farmer";
  const me = role === "buyer" ? rd("ks_buyers")[localStorage.getItem("ks_buyer_current")]
                              : rd("ks_users")[localStorage.getItem("ks_current")];
  const nav = document.querySelector("nav");
  if (nav) {
    const a = document.createElement("a");
    a.href = "profile.html"; a.setAttribute("data-lang", "n_profile");
    nav.appendChild(a);
    const page = location.pathname.split("/").pop() || "index.html";
    nav.querySelectorAll("a").forEach(function (x) {
      if (x.getAttribute("href") === page) x.classList.add("on");
    });
  }
  const head = document.querySelector("header");
  if (head && me) {
    const c = document.createElement("a");
    c.className = "avatar-chip notranslate"; c.href = "profile.html";
    c.textContent = (me.name || "?").trim().charAt(0).toUpperCase();
    head.insertBefore(c, document.getElementById("langbox"));
  }
})();