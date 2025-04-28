// src/hooks/useTTS.js
import { useRef, useState } from "react";

export function useTTS() {
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const playingRef = useRef(false);

  const processQueue = async () => {
    if (playingRef.current || queueRef.current.length === 0) {
      if (!playingRef.current && queueRef.current.length === 0) {
        setTtsPlaying(false);
      }
      return;
    }

    playingRef.current = true;
    setTtsPlaying(true);

    const { text, callback } = queueRef.current.shift();
    try {
      const snippet = encodeURIComponent(text.slice(0, 200));
      const res = await fetch(`/api/tts?text=${snippet}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      await new Promise((res, rej) => {
        audio.addEventListener("ended", res, { once: true });
        audio.addEventListener("error", rej, { once: true });
        audio.play().catch(rej);
      });
    } catch {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "pt-BR";
      speechSynthesis.speak(utter);
      await new Promise((r) => (utter.onend = r));
    }

    if (typeof callback === "function") callback();
    playingRef.current = false;
    processQueue();

    if (queueRef.current.length === 0) {
      setTtsPlaying(false);
    }
  };

  const playTTS = (text, callback) => {
    queueRef.current.push({ text, callback });
    processQueue();
  };

  return { playTTS, ttsPlaying, audioRef };
}
