/* ---------- LANGUAGE ENGINE ----------
   English + Hindi: written by hand in `words` (instant, works offline).
   Other 21 scheduled languages: the page is kept in English in `words`
   and Google Website Translator translates the whole page (including
   text added later by JavaScript). Needs internet + a local server
   (VS Code "Live Server"), because cookies do not work on file:// pages. */

const LANGS = [
  ["en","English"],["hi","हिन्दी"],["as","অসমীয়া"],["bn","বাংলা"],["brx","बड़ो"],
  ["doi","डोगरी"],["gu","ગુજરાતી"],["kn","ಕನ್ನಡ"],["ks","کٲشُر"],["kok","कोंकणी"],
  ["mai","मैथिली"],["ml","മലയാളം"],["mni-Mtei","ꯃꯤꯇꯩꯂꯣꯟ"],["mr","मराठी"],["ne","नेपाली"],
  ["or","ଓଡ଼ିଆ"],["pa","ਪੰਜਾਬੀ"],["sa","संस्कृतम्"],["sat","ᱥᱟᱱᱛᱟᱲᱤ"],["sd","سنڌي"],
  ["ta","தமிழ்"],["te","తెలుగు"],["ur","اردو"]
];
const NATIVE = ["en", "hi"];

const words = {
  en: {
    title: "Kisan Setu",
    n_home: "🏠 Home", n_predict: "📈 Price", n_chat: "💬 Chats",
    headline: "Sell your crop directly to the buyer",
    sub: "No middleman in between. All the money is yours.",
    btn_farmer: "🌾 I am a farmer", btn_buyer: "🛒 I am a buyer",
    btn_predict: "📈 Check fair price",
    how: "How does it work?",
    s1: "List your crop", s2: "See the fair price", s3: "Chat and negotiate", s4: "Get paid directly",
    footer: "Kisan Setu · a bridge between farmer and buyer",
    t1: "Enter your mobile number",
    mobile: "Mobile number (10 digits)",
    sendotp: "📲 Send code",
    otp: "4-digit code sent to your phone",
    otp_hint: "Demo code: 1234",
    verify: "✅ Continue",
    t2: "Tell us about yourself",
    name: "Your name", district: "District", village: "Village", next: "Continue",
    err_mobile: "Please enter a valid 10-digit number",
    err_otp: "Wrong code, please check again",
    err_fill: "Please fill in all the boxes",
    t3: "Tell us about your crop",
    crop: "Crop",
    c_wheat: "Wheat", c_rice: "Rice", c_tomato: "Tomato", c_onion: "Onion", c_potato: "Potato",
    qty: "How much do you have? (quintal)",
    price: "Your price per quintal (₹)",
    use_fair: "✨ Use the suggested fair price",
    submit: "✅ List my crop",
    mandi_label: "Nearby mandi price today (sample)",
    quintal: "quintal",
    above: "your price is higher than the mandi",
    below: "your price is lower than the mandi",
    same: "same as the mandi",
    err_crop: "Please enter quantity and price",
    t4: "Your crop is listed!",
    refno: "Reference number:",
    home: "🏠 Back to home",
    f_chats: "💬 See buyer messages", f_another: "➕ List another crop",
    f_mine: "Your listed crops",
    f_none: "You have not listed anything yet.",
    f_delete: "🗑 Remove",
    f_removed: "Listing removed",
    b_title: "Fresh crops from farmers",
    b_filter: "Show me", b_sort: "Sort by",
    so_new: "Newest first", so_low: "Price: low to high", so_high: "Price: high to low",
    c_all: "All crops",
    b_none: "No crops listed yet.",
    b_chat: "💬 Chat & negotiate",
    welcome: "Welcome",
    logout: "Not you? Log out",
    best_today: "Highest rate today for",
    contact_text: "Want buyers to call you directly? We will share your number only with registered buyers in",
    share: "📞 Yes, share my number",
    shared: "Done! Registered buyers can now call you from",
    b_reg: "Create your buyer account",
    b_mandi: "Your mandi city",
    b_area: "⭐ In your mandi area",
    b_call: "📞 Call farmer:",
    b_nonum: "Farmer has not shared the number yet",
    fair_tag: "Fair price",
    fair_ok: "✅ Fair price", fair_high: "⬆ Above fair price", fair_low: "⬇ Below fair price",
    voice_unsupported: "Voice typing does not work in this browser. Please use Chrome.",
    voice_error: "Could not hear you. Please try again.",
    quality: "Quality",
    q_a: "Grade A (best)",
    q_b: "Grade B (good)",
    q_c: "Grade C (average)",
    photo: "Photo of your crop",
    err_space: "Photo is too big or storage is full. Try another photo.",
    offer: "Buyer's offer per quintal (₹)",
    check: "🔍 Check this offer",
    source: "Source: Government of India,",
    v_low: "Offer is below the lowest government-reported mandi price. Ask for more.",
    v_mid: "Offer is within the government-reported mandi range.",
    v_high: "Offer is above the government-reported range. Good for you.",
    govref: "Government mandi reference",
    req_title: "Sample requests",
    r_ask: "📦 Ask for a sample",
    r_requested: "Sample requested. Waiting for the farmer.",
    r_send: "I will send a sample",
    r_collect: "Buyer should come and collect",
    p_title: "Fair price estimate",
    p_sub: "Pick your crop and see what price is fair today.",
    p_quality: "Quality", q_a: "A · Very good", q_b: "B · Normal", q_c: "C · Low",
    p_month: "Selling month",
    p_go: "Estimate",
    p_fair: "Fair price per quintal",
    p_range: "Likely range",
    p_best: "Best mandi now",
    p_total: "Total value of your crop",
    p_up: "Prices are expected to rise next month. Waiting may earn you more.",
    p_down: "Prices are expected to fall next month. Selling soon is safer.",
    p_flat: "Prices look steady next month.",
    p_forecast: "Next 6 months",
    p_list: "🌾 List my crop now",
    p_note: "Sample estimate from mandi prices and seasonal patterns. Not a guarantee.",
    ch_title: "Your conversations",
    ch_none: "No conversations yet. Buyers can start a chat from a crop listing.",
    ch_back: "← All chats",
    ch_send: "Send", ch_offer: "Make a price offer (₹ per quintal)",
    ch_offerbtn: "💰 Offer",
    ch_accept: "✅ Accept this offer",
    ch_deal: "🤝 Deal agreed at",
    ch_offered: "💰 Offer:",
    ch_with: "Chat about",
    ch_you: "You",
    ch_login: "Please log in first",
    ch_err: "Type a message or a price",
    ch_open: "Open chat"
  },
  hi: {
    title: "किसान सेतु",
    n_home: "🏠 होम", n_predict: "📈 भाव", n_chat: "💬 चैट",
    headline: "अपनी फसल सीधे खरीदार को बेचें",
    sub: "बीच में कोई दलाल नहीं। सारा पैसा आपका।",
    btn_farmer: "🌾 मैं किसान हूँ", btn_buyer: "🛒 मैं खरीदार हूँ",
    btn_predict: "📈 सही भाव देखें",
    how: "यह कैसे काम करता है?",
    s1: "अपनी फसल लिखें", s2: "सही भाव देखें", s3: "चैट करें और मोलभाव करें", s4: "सीधे पैसे पाएँ",
    footer: "किसान सेतु · किसान और खरीदार के बीच एक पुल",
    t1: "अपना मोबाइल नंबर डालें",
    mobile: "मोबाइल नंबर (10 अंक)",
    sendotp: "📲 कोड भेजें",
    otp: "आपके फोन पर आया 4 अंकों का कोड",
    otp_hint: "डेमो कोड: 1234",
    verify: "✅ आगे बढ़ें",
    t2: "अपने बारे में बताएँ",
    name: "आपका नाम", district: "जिला", village: "गाँव", next: "आगे बढ़ें",
    err_mobile: "कृपया सही 10 अंकों का नंबर डालें",
    err_otp: "कोड गलत है, फिर से देखें",
    err_fill: "कृपया सभी खाने भरें",
    t3: "अपनी फसल के बारे में बताएँ",
    crop: "फसल",
    c_wheat: "गेहूँ", c_rice: "चावल", c_tomato: "टमाटर", c_onion: "प्याज", c_potato: "आलू",
    qty: "आपके पास कितनी है? (क्विंटल)",
    price: "आपका भाव प्रति क्विंटल (₹)",
    use_fair: "✨ सुझाया गया सही भाव लगाएँ",
    submit: "✅ मेरी फसल लिखें",
    mandi_label: "आज पास की मंडी का भाव (नमूना)",
    quintal: "क्विंटल",
    above: "आपका भाव मंडी से ज़्यादा है",
    below: "आपका भाव मंडी से कम है",
    same: "मंडी के बराबर है",
    err_crop: "कृपया मात्रा और भाव डालें",
    t4: "आपकी फसल दर्ज हो गई!",
    refno: "संदर्भ संख्या:",
    home: "🏠 होम पर वापस",
    f_chats: "💬 खरीदारों के संदेश देखें", f_another: "➕ दूसरी फसल लिखें",
    f_mine: "आपकी दर्ज की हुई फसलें",
    f_none: "आपने अभी तक कुछ दर्ज नहीं किया।",
    f_delete: "🗑 हटाएँ",
    f_removed: "फसल हटा दी गई",
    b_title: "किसानों की ताज़ा फसलें",
    b_filter: "मुझे दिखाओ", b_sort: "क्रम",
    so_new: "सबसे नई पहले", so_low: "भाव: कम से ज़्यादा", so_high: "भाव: ज़्यादा से कम",
    c_all: "सभी फसलें",
    b_none: "अभी कोई फसल दर्ज नहीं है।",
    b_chat: "💬 चैट और मोलभाव",
    welcome: "स्वागत है",
    logout: "आप नहीं हैं? लॉग आउट करें",
    best_today: "आज सबसे ऊँचा भाव",
    contact_text: "चाहते हैं खरीदार सीधे फोन करें? हम आपका नंबर केवल इन मंडी शहरों के पंजीकृत खरीदारों को देंगे:",
    share: "📞 हाँ, मेरा नंबर साझा करें",
    shared: "हो गया! पंजीकृत खरीदार अब यहाँ से आपको फोन कर सकते हैं:",
    b_reg: "अपना खरीदार खाता बनाएँ",
    b_mandi: "आपकी मंडी का शहर",
    b_area: "⭐ आपकी मंडी के इलाके में",
    b_call: "📞 किसान को फोन करें:",
    b_nonum: "किसान ने अभी नंबर साझा नहीं किया",
    fair_tag: "सही भाव",
    fair_ok: "✅ सही भाव", fair_high: "⬆ सही भाव से ऊपर", fair_low: "⬇ सही भाव से नीचे",
    voice_unsupported: "इस ब्राउज़र में बोलकर लिखना नहीं चलता। कृपया Chrome इस्तेमाल करें।",
    voice_error: "आपकी आवाज़ सुनाई नहीं दी। फिर से कोशिश करें।",
    p_title: "सही भाव का अनुमान",
    p_sub: "अपनी फसल चुनें और देखें आज कौन-सा भाव सही है।",
    p_quality: "गुणवत्ता", q_a: "A · बहुत अच्छी", q_b: "B · सामान्य", q_c: "C · कम",
    p_month: "बेचने का महीना",
    p_go: "अनुमान लगाएँ",
    p_fair: "सही भाव प्रति क्विंटल",
    p_range: "संभावित सीमा",
    p_best: "अभी सबसे अच्छी मंडी",
    p_total: "आपकी फसल की कुल कीमत",
    p_up: "अगले महीने भाव बढ़ने की उम्मीद है। रुकने से ज़्यादा कमाई हो सकती है।",
    p_down: "अगले महीने भाव गिरने की उम्मीद है। जल्दी बेचना सुरक्षित है।",
    p_flat: "अगले महीने भाव स्थिर दिखते हैं।",
    p_forecast: "अगले 6 महीने",
    p_list: "🌾 अभी मेरी फसल लिखें",
    p_note: "यह मंडी भाव और मौसमी रुझान से निकाला गया नमूना अनुमान है। गारंटी नहीं।",
    ch_title: "आपकी बातचीत",
    ch_none: "अभी कोई बातचीत नहीं। खरीदार फसल की सूची से चैट शुरू कर सकते हैं।",
    ch_back: "← सभी चैट",
    ch_send: "भेजें", ch_offer: "भाव का प्रस्ताव दें (₹ प्रति क्विंटल)",
    ch_offerbtn: "💰 प्रस्ताव",
    ch_accept: "✅ यह प्रस्ताव मानें",
    ch_deal: "🤝 सौदा पक्का, भाव",
    ch_offered: "💰 प्रस्ताव:",
    ch_with: "चैट का विषय",
    ch_you: "आप",
    ch_login: "कृपया पहले लॉग इन करें",
    ch_err: "संदेश या भाव लिखें",
    ch_open: "चैट खोलें"
  }
};

let lang = localStorage.getItem("lang") || "en";

function t(key) {
  return (words[lang] && words[lang][key]) || words.en[key] || key;
}

/* ---- Google Translate for the other 21 languages ---- */
function gtCookie() {
  const m = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return m ? m[1] : "";
}
function setGtCookie(code) {
  const v = code ? "/en/" + code : "";
  const exp = code ? "" : "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "googtrans=" + v + "; path=/" + exp;
  document.cookie = "googtrans=" + v + "; path=/; domain=" + location.hostname + exp;
}
function loadGoogle() {
  window.gtInit = function () {
    new google.translate.TranslateElement({ pageLanguage: "en", autoDisplay: false }, "gt_box");
  };
  const box = document.createElement("div");
  box.id = "gt_box";
  document.body.appendChild(box);
  const s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=gtInit";
  document.body.appendChild(s);
}

function applyWords() {
  document.querySelectorAll("[data-lang]").forEach(function (el) {
    el.textContent = t(el.dataset.lang);
  });
  document.documentElement.lang = lang;
  const sel = document.getElementById("langsel");
  if (sel) sel.value = lang;
  if (typeof window.onLang === "function") window.onLang();
}

function setLang(l) {
  if (l === lang && (NATIVE.includes(l) ? !gtCookie() : gtCookie() === l)) return;
  lang = l;
  localStorage.setItem("lang", l);
  // other languages: keep English text, let Google translate; reload so it applies
  if (NATIVE.includes(l)) {
    if (gtCookie()) { setGtCookie(""); location.reload(); return; }
  } else if (gtCookie() !== l) {
    setGtCookie(l); location.reload(); return;
  }
  applyWords();
}

function buildLangBox() {
  const box = document.getElementById("langbox");
  if (!box) return;
  const sel = document.createElement("select");
  sel.id = "langsel";
  sel.setAttribute("aria-label", "Language");
  LANGS.forEach(function (p) {
    const o = document.createElement("option");
    o.value = p[0]; o.textContent = p[1];
    sel.appendChild(o);
  });
  sel.onchange = function () { setLang(sel.value); };
  box.appendChild(sel);
}

window.addEventListener("load", function () {
  buildLangBox();
  // keep text language in sync with the translation cookie
  const g = gtCookie();
  if (g && lang !== g) { lang = g; localStorage.setItem("lang", g); }
  if (!g && !NATIVE.includes(lang)) { lang = "en"; localStorage.setItem("lang", "en"); }
  applyWords();
  if (g) loadGoogle();
});