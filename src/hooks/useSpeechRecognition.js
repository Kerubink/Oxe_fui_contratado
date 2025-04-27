// src/hooks/useSpeechRecognition.js
import { useEffect, useRef, useState } from "react";

export function useSpeechRecognition({ awaitingResponse, ttsPlaying }) {
  const [transcript, setTranscript] = useState("");
  const [micOn, setMicOn] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef(""); // acumulador seguro

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition API não disponível.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      // Mostrar no textarea o final + o atual que ainda está sendo falado
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;

    if (micOn && awaitingResponse && !ttsPlaying) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Erro ao iniciar reconhecimento:", error);
        }
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Erro ao parar reconhecimento:", error);
      }
    }
  }, [micOn, awaitingResponse, ttsPlaying]);

  const startRecognition = () => {
    setTranscript("");
    finalTranscriptRef.current = "";
    setMicOn(true);
  };

  const stopRecognition = () => {
    setMicOn(false);
    try {
      recognitionRef.current?.stop();
    } catch (error) {
      console.error("Erro ao parar reconhecimento:", error);
    }
  };

  return {
    transcript,
    setTranscript,
    micOn,
    setMicOn,
    startRecognition,
    stopRecognition,
    recognitionRef
  };
}
