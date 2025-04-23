// src/hooks/useInterviewEngine.js
import { useState, useRef, useEffect } from "react";
import localforage from "localforage";
import { useTTS } from "./useTTS";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useCamera } from "./useCamera";
import { useFaceMonitor } from "./useFaceMonitor";

export function useInterviewEngine() {
  const [roteiro, setRoteiro] = useState(null);
  const [idx, setIdx] = useState(0);
  const [chat, setChat] = useState([]);
  const [chatVisible, setChatVisible] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);

  const videoRef = useRef(null);

  const {
    playTTS,
    ttsPlaying,
    audioRef,
  } = useTTS();

  const {
    transcript,
    setTranscript,
    micOn,
    setMicOn,
    recognitionRef
  } = useSpeechRecognition({ awaitingResponse, ttsPlaying });

  useCamera(videoRef, camOn, interviewStarted);
  const { userVisible } = useFaceMonitor(videoRef, camOn, interviewStarted, playTTS);

  // 🔁 Avança as perguntas do roteiro
  useEffect(() => {
    if (!roteiro || idx >= roteiro.length) return;

    (async () => {
      const pergunta = roteiro[idx].pergunta;
      setChat((c) => [...c, { sender: "Entrevistador", text: pergunta }]);
      setAwaitingResponse(false);
      setMicOn(false);
      setTranscript("");
      await playTTS(pergunta);
      setAwaitingResponse(true);
    })();
  }, [roteiro, idx]);

  // 🎤 Toggle e envio de resposta
  const toggleMic = () => {
    micOn ? sendResponse() : setMicOn(true);
  };

  const sendResponse = async () => {
    if (isSending || !transcript.trim()) return;
    setIsSending(true);
    setMicOn(false);

    const resposta = transcript.trim();
    setChat((c) => [...c, { sender: "Você", text: resposta }]);

    const stored = await localforage.getItem("roteiroEntrevista");
    if (stored) {
      const lenI = stored.inicio.length;
      const lenM = stored.meio.length;
      const lenT = stored.tecnicas.length;
      let fase, pos;
      if (idx < lenI) {
        fase = "inicio"; pos = idx;
      } else if (idx < lenI + lenM) {
        fase = "meio"; pos = idx - lenI;
      } else if (idx < lenI + lenM + lenT) {
        fase = "tecnicas"; pos = idx - lenI - lenM;
      } else {
        fase = "encerramento"; pos = idx - lenI - lenM - lenT;
      }
      stored[fase][pos].resposta = resposta;
      await localforage.setItem("roteiroEntrevista", stored);
    }

    setIdx((i) => i + 1);
    setIsSending(false);
  };

  // ▶️ Iniciar entrevista
  const startInterview = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setInterviewStarted(true);

      const stored = await localforage.getItem("roteiroEntrevista");
      if (stored) {
        setRoteiro([
          ...stored.inicio,
          ...stored.meio,
          ...stored.tecnicas,
          ...stored.encerramento,
        ]);
      }
    } catch {
      alert("Permita câmera e microfone para continuar.");
    }
  };

  return {
    videoRef,
    audioRef,
    transcript,
    setTranscript,
    micOn,
    toggleMic,
    camOn,
    setCamOn,
    chat,
    chatVisible,
    setChatVisible,
    sendResponse,
    isSending,
    startInterview,
    interviewStarted,
    userVisible,
  };
}
