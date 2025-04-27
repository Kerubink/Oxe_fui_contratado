// src/hooks/useTTS.js
import { useRef, useState } from "react";

export function useTTS() {
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const queueRef = useRef([]); // fila de { text, resolve, reject }
  const audioRef = useRef(null);

  const processQueue = async () => {
    if (ttsPlaying || queueRef.current.length === 0) return;
    setTtsPlaying(true);

    const { text, resolve, reject } = queueRef.current[0];
    try {
      // 1) tentar via API própria
      const snippet = encodeURIComponent(text.slice(0, 200));
      const res = await fetch(`/api/tts?text=${snippet}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      await new Promise((resEvt, rejEvt) => {
        audio.addEventListener("ended", resEvt, { once: true });
        audio.addEventListener("error", rejEvt, { once: true });
        audio.play();
      });
      URL.revokeObjectURL(url);
    } catch (err) {
      // 2) fallback nativo
      speechSynthesis.cancel();
      await new Promise((resEvt) => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "pt-BR";
        utter.onend = resEvt;
        speechSynthesis.speak(utter);
      });
    }

    // concluiu este texto
    queueRef.current.shift();
    setTtsPlaying(false);
    resolve();            // avisa quem chamou playTTS()
    processQueue();       // continua com o próximo
  };

  const playTTS = (text) => {
    return new Promise((resolve, reject) => {
      queueRef.current.push({ text, resolve, reject });
      processQueue();
    });
  };

  return { playTTS, ttsPlaying, audioRef };
}
