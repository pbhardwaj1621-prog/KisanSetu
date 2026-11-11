const words = {
  en: {
    title: "Kisan Setu",
    headline: "Sell your crop directly to the buyer",
    sub: "No middleman in between. All the money is yours.",
    btn_farmer: "🌾 I am a farmer",
    btn_buyer: "🛒 I am a buyer",
    how: "How does it work?",
    s1: "List your crop",
    s2: "Pick a buyer",
    s3: "Get paid directly",
    footer: "Kisan Setu · a bridge between farmer and buyer",
    t1: "Enter your mobile number",
    mobile: "Mobile number (10 digits)",
    sendotp: "📲 Send code",
    otp: "4-digit code sent to your phone",
    verify: "✅ Continue",
    t2: "Tell us about yourself",
    name: "Your name",
    district: "District",
    village: "Village",
    next: "Continue",
    err_mobile: "Please enter a valid 10-digit number",
    err_otp: "Wrong code, please check again",
    err_fill: "Please fill in all the boxes",
    t3: "Tell us about your crop",
    crop: "Crop",
    c_wheat: "Wheat",
    c_rice: "Rice",
    c_tomato: "Tomato",
    c_onion: "Onion",
    c_potato: "Potato",
    qty: "How much do you have? (quintal)",
    price: "Your price per quintal (₹)",
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
        home: "🏠 Back to home",
    b_title: "Fresh crops from farmers",
    b_filter: "Show me",
    c_all: "All crops",
    b_request: "📩 Send request to farmer",
    b_sent: "✅ Request sent",
    b_none: "No crops listed yet.",
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
    
    voice_unsupported: "Voice typing does not work in this browser. Please use Chrome.",
    voice_error: "Could not hear you. Please try again."
  },
  hi: {
  }
};

let lang = localStorage.getItem("lang") || "en";

function t(key) {
  return (words[lang] && words[lang][key]) || words.en[key];
}

function setLang(l) {
  lang = l;
  localStorage.setItem("lang", l);
  document.querySelectorAll("[data-lang]").forEach(function (el) {
    el.textContent = t(el.dataset.lang);
  });
  document.documentElement.lang = l;
  if (typeof showMandi === "function") showMandi();
    if (typeof renderList === "function") renderList();
}

setLang(lang);