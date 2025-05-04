// src/hooks/useTTS.js
import { useState, useRef, useEffect } from "react";
import localforage from "localforage";

export function useTTS() {
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const playingRef = useRef(false);
  const voicesRef = useRef([]);
  // Mantém referências para evitar GC prematuro :contentReference[oaicite:5]{index=5}
  const utterancesRef = useRef([]);

  const MAX_CHUNK_LENGTH = 200;

  // 1) Carrega vozes e prioriza locais :contentReference[oaicite:6]{index=6}
  useEffect(() => {
    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices();
      // Prioriza vozes locais
      voicesRef.current = all.filter(v => v.localService).concat(all.filter(v => !v.localService));
    };
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    loadVoices();
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // 2) Divide o texto em chunks sem cortar frases
  const splitTextIntoChunks = (text) => {
    const sentences = text.match(/[^.!?]+[.!?]+|\s*\n\s*|.+$/g) || [];
    const chunks = [];
    let current = "";
    for (let raw of sentences) {
      const sentence = raw.trim();
      if (!sentence) continue;
      const combined = (current + " " + sentence).trim();
      if (combined.length <= MAX_CHUNK_LENGTH) {
        current = combined;
      } else {
        if (current) chunks.push(current);
        current = sentence;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  };

  // 3) Fala um chunk nativamente, chamando resume para evitar hang :contentReference[oaicite:7]{index=7}
  const speakChunkNative = (chunk, voice) => {
    return new Promise((resolve, reject) => {
      const utt = new SpeechSynthesisUtterance(chunk);
      utt.lang = "pt-BR";
      if (voice) utt.voice = voice;
      // Armazena referência para evitar GC
      utterancesRef.current.push(utt);
      utt.onstart = () => {
        // Garanta estado não-pausado
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      };
      utt.onend = resolve;
      utt.onerror = reject;
      window.speechSynthesis.speak(utt);
    });
  };

  // 4) Fallback externo em chunks completos
  const speakChunkFallback = async (text) => {
    const chunks = splitTextIntoChunks(text);
    for (const chunk of chunks) {
      const snippet = encodeURIComponent(chunk);
      const res = await fetch(`/api/tts?text=${snippet}`);
      if (!res.ok) throw new Error("Fallback TTS falhou");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      await new Promise((resolve, reject) => {
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = resolve;
        audio.onerror = reject;
        audio.play();
      });
    }
  };

  // 5) Processa fila, sempre reiniciando em finally :contentReference[oaicite:8]{index=8}
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
      // Lê gênero do entrevistador
      let gender = null;
      try {
        const ficha = await localforage.getItem("fichaEntrevista");
        gender = ficha?.interviewer?.gender || null;
      } catch {}

      // Seleciona voz pt-BR :contentReference[oaicite:9]{index=9}
      const ptVoices = voicesRef.current.filter(v => v.lang.startsWith("pt"));
      let chosen = null;
      if (gender === "Feminino") {
        chosen = ptVoices.find(v => v.name.toLowerCase().includes("female"));
      } else if (gender === "Masculino") {
        chosen = ptVoices.find(v => v.name.toLowerCase().includes("male"));
      }
      chosen = chosen || ptVoices[0] || null;

      // Cancela apenas uma vez antes de falar o primeiro chunk :contentReference[oaicite:10]{index=10}
      window.speechSynthesis.cancel();

      // Fala nativamente em chunks
      const chunks = splitTextIntoChunks(text);
      for (const chunk of chunks) {
        // Se pausado, retoma :contentReference[oaicite:11]{index=11}
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        await speakChunkNative(chunk, chosen);
      }
    } catch (nativeErr) {
      console.warn("Erro no TTS nativo:", nativeErr);
      try {
        await speakChunkFallback(text);
      } catch (fallbackErr) {
        console.error("Fallback TTS também falhou:", fallbackErr);
      }
    } finally {
      if (typeof callback === "function") {
        try { callback(); } catch {}
      }
      playingRef.current = false;
      processQueue(); // reinicia fila :contentReference[oaicite:12]{index=12}
    }
  };

  // 6) API pública para enfileirar texto
  const playTTS = (text, callback) => {
    queueRef.current.push({ text, callback });
    // Se estiver pausado, retoma antes de enfileirar
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    processQueue();
  };

  return {
    playTTS,
    ttsPlaying,
    audioRef,
  };
}
