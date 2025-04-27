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
  const [idx, setIdx] = useState(-1); // Começa em -1 para mostrar a mensagem de boas-vindas
  const [chat, setChat] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [chatVisible, setChatVisible] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { playTTS, ttsPlaying, audioRef } = useTTS();
  const say = async (text) => {
    setChat(c => [...c, { sender: "Entrevistador", text }]);
    await playTTS(text);
  };

  const {
    transcript: srTranscript,
    setTranscript: setSRTranscript,
    micOn,
    setMicOn,
    recognitionRef,
    stopRecognition
  } = useSpeechRecognition({ awaitingResponse, ttsPlaying });

  const transcriptRef = useRef("");
  const [transcriptState, _setTranscriptState] = useState("");
  const setTranscript = (text) => {
    transcriptRef.current = text;
    _setTranscriptState(text);
  };
  useEffect(() => {
    setTranscript(srTranscript);
  }, [srTranscript]);

  const videoRef = useRef(null);
  useCamera(videoRef, camOn, interviewStarted);

  const startInterview = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setInterviewStarted(true);
      const stored = await localforage.getItem("roteiroEntrevista");
      if (stored) {
        setRoteiro([
          ...stored.inicio,
          ...stored.meio,
          ...stored.tecnicas,
          ...stored.encerramento
        ]);
      }
    } catch {
      alert("Permita o uso da câmera e microfone para continuar!");
    }
  };

  const sendResponse = async (isAuto = false) => {
    const text = transcriptRef.current.trim();
    if ((isSending && !isAuto) || (!isAuto && !text)) return;

    setIsSending(true);
    setMicOn(false);
    stopRecognition();

    if (text) {
      setChat(c => [...c, { sender: "Você", text }]);
      const stored = await localforage.getItem("roteiroEntrevista");
      if (stored) {
        const sections = ['inicio', 'meio', 'tecnicas', 'encerramento'];
        const section = sections.find(sec => idx < stored[sec]?.length) || 'encerramento';
        if (stored[section]) {
          stored[section][idx % stored[section].length].resposta = text;
          await localforage.setItem("roteiroEntrevista", stored);
        }
      }
    }

    setTranscript("");
    setIsSending(false);
    setIdx(i => i + 1);
  };

  useFaceMonitor({
    videoRef,
    camOn,
    interviewStarted,
    say,
    micOn,
    transcript: transcriptState,
    awaitingResponse
  });

  useTimeMonitor({
    currentQuestion,
    awaitingResponse,
    playTTS: say,
    sendSystemMessage: (msg) =>
      setChat(c => [...c, { sender: "Entrevistador", text: msg }]),
    forceNextQuestion: () => setIdx(i => i + 1),
    sendResponse
  });

  useEffect(() => {
    if (roteiro === null) return;
  
    (async () => {
      if (idx === -1) {
        await say("Olá! Seja bem-vindo à nossa entrevista. Vamos começar!");
        setIdx(0);
        return;
      }
  
      if (idx >= roteiro.length) {
        await say("Entrevista finalizada! Muito obrigado pela sua participação.");
        setInterviewStarted(false);
        return;
      }
  
      const connectionPhrases = [
        "Hmmm, deixa eu pensar...",
        "Ok, eu quero saber de você...",
        "Me fale então...",
        "Gostaria de saber...",
        "Vamos lá...",
        "Agora me conte..."
      ];
  
      const connection = connectionPhrases[Math.floor(Math.random() * connectionPhrases.length)];
  
      const question = roteiro[idx];
      setCurrentQuestion(question);
  
      setAwaitingResponse(false);
      setMicOn(false);
      setTranscript("");
      setSRTranscript("");
  
      // Enviar a frase de conexão separadamente (apenas uma vez)
      await say(connection);
      setChat(c => [...c, { sender: "Entrevistador", text: connection }]);
  
      // Enviar a pergunta separadamente (apenas uma vez)
      await say(question.pergunta);
      setChat(c => [...c, { sender: "Entrevistador", text: question.pergunta }]);
  
      setAwaitingResponse(true);
      recognitionRef.current?.start();
    })();
  }, [roteiro, idx]);

  return {
    videoRef,
    audioRef,
    transcript: transcriptState,
    setTranscript,
    srTranscript,
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
    userVisible: true // sempre true aqui, FaceMonitor já dá alertas
  };
}
