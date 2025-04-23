// src/hooks/useSpeechRecognition.js
import { useEffect, useRef, useState } from "react";

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export function useSpeechRecognition({ awaitingResponse, ttsPlaying }) {
  const [transcript, setTranscript] = useState("");
  const [micOn, setMicOn] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SR) return;
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text.trim());
    };

    rec.onend = () => {
      if (micOn && awaitingResponse && !ttsPlaying) rec.start();
    };

    rec.onerror = () => setMicOn(false);

    recognitionRef.current = rec;
  }, []);

  useEffect(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (micOn && awaitingResponse && !ttsPlaying) {
      setTranscript("");
      rec.start();
    } else {
      rec.stop();
    }
  }, [micOn, awaitingResponse, ttsPlaying]);

  return {
    transcript,
    setTranscript,
    micOn,
    setMicOn,
    recognitionRef,
  };
}
