export function speak(text: string, rate = 1) {
  if (!("speechSynthesis" in window)) return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = rate;
  utterance.lang = "es-EE";

  speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  speechSynthesis.cancel();
}

export function pauseSpeech() {
  speechSynthesis.pause();
}

export function resumeSpeech() {
  speechSynthesis.resume();
}
