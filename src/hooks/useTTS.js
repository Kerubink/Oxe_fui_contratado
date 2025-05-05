// src/hooks/useTTS.js
import { useState, useRef, useEffect } from "react";
import localforage from "localforage";

export function useTTS() {
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const playingRef = useRef(false);
  const voicesRef = useRef([]);
  const utterancesRef = useRef([]); // previne GC prematuro

  const MAX_CHUNK_LENGTH = 150; // margem de segurança abaixo de 200 chars

  // Carrega vozes e prioriza locais
  useEffect(() => {
    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices();
      voicesRef.current = [
        ...all.filter(v => v.localService),
        ...all.filter(v => !v.localService)
      ];
    };
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    loadVoices();
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // Fragmenta texto em chunks ≤ MAX_CHUNK_LENGTH sem cortar frases
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

  // Fala um chunk nativamente, com resume em onstart e onboundary
  const speakChunkNative = (chunk, voice) => {
    return new Promise((resolve, reject) => {
      const utt = new SpeechSynthesisUtterance(chunk);
      utt.lang = "pt-BR";
      if (voice) utt.voice = voice;
      utterancesRef.current.push(utt);

      utt.onstart = () => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      };
      utt.onboundary = () => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      };
      utt.onend = resolve;
      utt.onerror = reject;
      window.speechSynthesis.speak(utt);
    });
  };

  // Fallback completo em chunks via endpoint /api/tts
  const speakChunkFallback = async (text) => {
    const chunks = splitTextIntoChunks(text);
    for (const chunk of chunks) {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(chunk)}`);
      if (!res.ok) throw new Error("Fallback TTS falhou");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      await new Promise((resA, rejA) => {
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = resA;
        audio.onerror = rejA;
        audio.play();
      });
    }
  };

  // Processa a fila de chunks, sempre reiniciando em finally
  const processQueue = async () => {
    if (playingRef.current || queueRef.current.length === 0) {
      if (!playingRef.current) setTtsPlaying(false);
      return;
    }

    playingRef.current = true;
    setTtsPlaying(true);
    const { text, callback } = queueRef.current.shift();

    try {
      // Seleciona voz pt-BR por gênero armazenado
      let gender = null;
      try {
        const ficha = await localforage.getItem("fichaEntrevista");
        gender = ficha?.interviewer?.gender || null;
      } catch {}

      const ptVoices = voicesRef.current.filter(v => v.lang.startsWith("pt"));
      let chosen = null;
      if (gender === "Feminino") {
        chosen = ptVoices.find(v => v.name.toLowerCase().includes("female"));
      } else if (gender === "Masculino") {
        chosen = ptVoices.find(v => v.name.toLowerCase().includes("male"));
      }
      chosen = chosen || ptVoices[0] || null;

      // Cancela apenas uma vez antes do primeiro chunk
      window.speechSynthesis.cancel();

      // Fala nativamente em chunks
      for (const chunk of splitTextIntoChunks(text)) {
        await speakChunkNative(chunk, chosen);
      }
    } catch (nativeErr) {
      console.warn("TTS nativo falhou:", nativeErr);
      try {
        await speakChunkFallback(text);
      } catch (fallbackErr) {
        console.error("Fallback TTS também falhou:", fallbackErr);
      }
    } finally {
      if (typeof callback === "function") {
        try {
          callback();
        } catch {}
      }
      playingRef.current = false;
      processQueue();
    }
  };

  // Reseta a fila antes de cada mensagem nova
  const resetQueue = () => {
    window.speechSynthesis.cancel();
    queueRef.current = [];
    utterancesRef.current = [];
  };

  // API pública: enfileira apenas os chunks desta única mensagem
  const playTTS = (text) => {
    return new Promise((resolve) => {
      resetQueue();
      for (const chunk of splitTextIntoChunks(text)) {
        queueRef.current.push({ text: chunk, callback: null });
      }
      // ao fim de todos os chunks, resolve a Promise
      queueRef.current.push({ text: "", callback: resolve });
      processQueue();
    });
  };

  return {
    playTTS,
    ttsPlaying,
    audioRef,
  };
}
