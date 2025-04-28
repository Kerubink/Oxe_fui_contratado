// src/hooks/useSpeechRecognition.js
import { useEffect, useRef, useState } from "react";

export function useSpeechRecognition({ awaitingResponse, ttsPlaying }) {
  const [transcript, setTranscript] = useState("");
  const [micOn, setMicOn] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef(""); // acumulador interno

  // Inicializa o recognition uma única vez
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition API não disponível.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscriptRef.current + interim);
    };

    recognition.onend = () => {
      // Garantir que, se pararmos o mic, a instância seja reiniciável
      if (micOn && awaitingResponse && !ttsPlaying) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
  }, [awaitingResponse, ttsPlaying]);

  // Liga/desliga o recognition conforme micOn, awaitingResponse e ttsPlaying
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (micOn && awaitingResponse && !ttsPlaying) {
      try {
        recognition.start();
      } catch (e) {
        // InvalidStateError if já iniciado
      }
    } else {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }, [micOn, awaitingResponse, ttsPlaying]);

  // Abre o microfone: limpa buffers e estado antes de começar
  const startRecognition = () => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setMicOn(true);
  };

  // Fecha o microfone: para recognition e limpa buffers
  const stopRecognition = () => {
    setMicOn(false);
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    finalTranscriptRef.current = "";
    setTranscript("");
  };

  return {
    transcript,
    setTranscript,
    micOn,
    startRecognition,
    stopRecognition,
    recognitionRef,
  };
}
