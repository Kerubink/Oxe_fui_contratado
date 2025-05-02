// src/hooks/useTTS.js
import { useRef, useState, useEffect } from "react";
import localforage from "localforage";

export function useTTS() {
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const playingRef = useRef(false);
  const voicesRef = useRef([]);

  const MAX_CHUNK_LENGTH = 200;

  // Carrega as vozes e armazena em voicesRef
  useEffect(() => {
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    // Chrome dispara evento voiceschanged quando as vozes ficam disponíveis
    window.speechSynthesis.addEventListener("voiceschanged", load);
    load();
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
    };
  }, []);

  // Quebra texto em pedaços de até MAX_CHUNK_LENGTH sem cortar frases
  const splitTextIntoChunks = (text) => {
    const sentences = text.match(/[^.!?]+[.!?]+|\s*\n\s*|.+$/g) || [];
    const chunks = [];
    let current = "";

    for (let raw of sentences) {
      const sentence = raw.trim();
      if (!sentence) continue;
      if ((current + " " + sentence).trim().length <= MAX_CHUNK_LENGTH) {
        current = (current + " " + sentence).trim();
      } else {
        if (current) chunks.push(current);
        current = sentence;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  };

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

    // Pega o gênero do entrevistador do IndexedDB
    let gender = null;
    try {
      const ficha = await localforage.getItem("fichaEntrevista");
      gender = ficha?.interviewer?.gender || null;
    } catch (e) {
      console.warn("Não conseguiu ler fichaEntrevista:", e);
    }

    // --- 1) Tenta API Nativa com voz adequada ---
    try {
      speechSynthesis.cancel();           // cancela pendências
      window.speechSynthesis.getVoices(); // garante vozes carregadas

      const chunks = splitTextIntoChunks(text);
      for (const chunk of chunks) {
        if (!playingRef.current) throw new Error("cancelled");

        await new Promise((resolve, reject) => {
          const utt = new SpeechSynthesisUtterance(chunk);
          utt.lang = "pt-BR";

          // Seleção de voz baseado em gender
          const voices = voicesRef.current.filter(v => v.lang.startsWith("pt"));
          let chosen = null;
          if (gender === "Feminino") {
            chosen = voices.find(v =>
              v.name.toLowerCase().includes("female")
            );
          } else if (gender === "Masculino") {
            chosen = voices.find(v =>
              v.name.toLowerCase().includes("male")
            );
          }
          // se não encontrou, pega a primeira pt-BR
          utt.voice = chosen || voices[0] || null;

          utt.onend = resolve;
          utt.onerror = reject;
          speechSynthesis.speak(utt);
        });
      }
    } catch (nativeErr) {
      console.warn("Native TTS falhou ou foi cancelado, usando fallback externo:", nativeErr);

      // --- 2) Fallback para seu endpoint /api/tts ---
      const snippet = encodeURIComponent(text.slice(0, MAX_CHUNK_LENGTH));
      try {
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
      } catch (fallbackErr) {
        console.error("Fallback TTS também falhou:", fallbackErr);
      }
    }

    // executa callback e segue fila
    if (typeof callback === "function") {
      try {
        callback();
      } catch (cbErr) {
        console.error("Erro no callback do TTS:", cbErr);
      }
    }

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
