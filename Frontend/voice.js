function speak(inputId) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert(t("voice_unsupported"));
    return;
  }
  const rec = new SR();
  rec.lang = (lang === "hi") ? "hi-IN" : "en-IN";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  const btn = document.querySelector('[data-mic="' + inputId + '"]');
  btn.textContent = "🔴";

  rec.onresult = function (e) {
    document.getElementById(inputId).value = e.results[0][0].transcript;
  };
  rec.onerror = function () {
    alert(t("voice_error"));
  };
  rec.onend = function () {
    btn.textContent = "🎤";
  };
  rec.start();
}