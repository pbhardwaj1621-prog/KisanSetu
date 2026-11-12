const SR_LANG = { en: "en-IN", hi: "hi-IN", bn: "bn-IN", gu: "gu-IN", kn: "kn-IN", ml: "ml-IN",
  mr: "mr-IN", ta: "ta-IN", te: "te-IN", ur: "ur-IN", pa: "pa-IN", ne: "ne-NP", as: "as-IN", or: "or-IN" };

function speak(inputId) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert(t("voice_unsupported")); return; }
  const rec = new SR();
  rec.lang = SR_LANG[lang] || "hi-IN";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  const btn = document.querySelector('[data-mic="' + inputId + '"]');
  if (btn) { btn.textContent = "🔴"; btn.classList.add("rec"); }
  rec.onresult = function (e) { document.getElementById(inputId).value = e.results[0][0].transcript; };
  rec.onerror = function () { toast(t("voice_error")); };
  rec.onend = function () { if (btn) { btn.textContent = "🎤"; btn.classList.remove("rec"); } };
  rec.start();
}