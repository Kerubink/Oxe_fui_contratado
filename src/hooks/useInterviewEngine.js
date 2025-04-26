// src/hooks/useInterviewEngine.js
import { useState, useRef, useEffect } from "react";
import localforage from "localforage";
import { useTTS } from "./useTTS";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useCamera } from "./useCamera";
import { useFaceMonitor } from "./useFaceMonitor";
import { useTimeMonitor } from "./useTimeMonitor";

export function useInterviewEngine() {
  const [roteiro, setRoteiro] = useState(null);
  const [idx, setIdx] = useState(0);
  const [chat, setChat] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [chatVisible, setChatVisible] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);

  const videoRef = useRef(null);

  const { playTTS, ttsPlaying, audioRef } = useTTS();

  const {
    transcript,
    setTranscript,
    micOn,
    setMicOn,
    recognitionRef,
    stopRecognition
  } = useSpeechRecognition({ awaitingResponse, ttsPlaying });

  useCamera(videoRef, camOn, interviewStarted);
  const { userVisible } = useFaceMonitor(
    videoRef,
    camOn,
    interviewStarted,
    playTTS,
    micOn,
    transcript,
    awaitingResponse
  );

  useEffect(() => {
    if (!roteiro || idx >= roteiro.length) return;

    (async () => {
      const question = roteiro[idx];
      setCurrentQuestion(question);
      setChat((c) => [...c, { sender: "Entrevistador", text: question.pergunta }]);
      setAwaitingResponse(false);
      setMicOn(false);
      setTranscript("");
      
      await playTTS(question.pergunta);
      
      setTimeout(async () => {
        await playTTS("Por favor, responda agora.");
        setAwaitingResponse(true);
      }, 1500);
    })();
  }, [roteiro, idx]);

  const sendResponse = async (isAuto = false) => {
    if ((isSending && !isAuto) || (!isAuto && !transcript.trim())) return;
    
    setIsSending(true);
    setMicOn(false);
    stopRecognition();

    if (transcript.trim()) {
      setChat((c) => [...c, { sender: "Você", text: transcript.trim() }]);
      
      const stored = await localforage.getItem("roteiroEntrevista");
      if (stored) {
        const sections = ['inicio', 'meio', 'tecnicas', 'encerramento'];
        const currentSection = sections.find(section => 
          idx < stored[section].length
        ) || 'encerramento';
        stored[currentSection][idx % stored[currentSection].length].resposta = transcript.trim();
        await localforage.setItem("roteiroEntrevista", stored);
      }
    }

    setIsSending(false);
  };

  const forceNextQuestion = () => {
    setIdx(i => i + 1);
  };

  const startInterview = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setInterviewStarted(true);

      const stored = await localforage.getItem("roteiroEntrevista");
      if (stored) {
        setRoteiro([...stored.inicio, ...stored.meio, ...stored.tecnicas, ...stored.encerramento]);
      }
    } catch {
      alert("Permita câmera e microfone para continuar.");
    }
  };

  useTimeMonitor({
    currentQuestion,
    awaitingResponse,
    playTTS,
    sendSystemMessage: (text) => setChat(c => [...c, { sender: "Sistema", text }]),
    forceNextQuestion,
    sendResponse
  });

  return {
    videoRef,
    audioRef,
    transcript,
    setTranscript,
    micOn,
    toggleMic: () => micOn ? sendResponse() : setMicOn(true),
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