// src/hooks/useInterviewEngine.js
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";
import { useTTS } from "./useTTS";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useCamera } from "./useCamera";

export function useInterviewEngine() {
  // estados principais
  const [roteiro, setRoteiro] = useState([]);
  const [idx, setIdx] = useState(0);
  const [chat, setChat] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [chatVisible, setChatVisible] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);

  const navigate = useNavigate();
  const videoRef = useRef(null);

  // TTS
  const { playTTS, ttsPlaying, audioRef } = useTTS();

  // STT
  const {
    transcript: recognitionTranscript,
    setTranscript: setRecognitionTranscript,
    micOn,
    startRecognition,
    stopRecognition,
  } = useSpeechRecognition({ awaitingResponse, ttsPlaying });

  // sincronia STT → textarea
  useEffect(() => {
    if (micOn) setTranscript(recognitionTranscript);
  }, [recognitionTranscript, micOn]);

  // câmera (opcional)
  useCamera(videoRef, camOn, interviewStarted);

  // toggle mic: abrir ou fechar → enviar
  const toggleMic = () => {
    if (micOn) {
      stopRecognition();
      sendResponse();
    } else {
      setTranscript("");
      setRecognitionTranscript("");
      startRecognition();
    }
  };

  // carrega nomes e roteiro completo (intro + seções + encerramento)
  useEffect(() => {
    (async () => {
      const user = localStorage.getItem("usuarioNome") || "candidato";
      const ficha = await localforage.getItem("fichaEntrevista");
      const interviewer = ficha?.interviewer?.name || "Entrevistador";
      const stored = (await localforage.getItem("roteiroEntrevista")) || {
        inicio: [], meio: [], tecnicas: [], encerramento: []
      };

      setRoteiro([
        { pergunta: `Olá, ${user}! Seja bem-vindo. Eu sou ${interviewer} e vou te entrevistar hoje.` },
        ...stored.inicio,
        ...stored.meio,
        ...stored.tecnicas,
        ...stored.encerramento,
        { pergunta: "Muito obrigado por sua participação! Foi um prazer conversar com você. Até breve." }
      ]);
    })();
  }, []);

  // dispara cada pergunta (sem ainda redirecionar)
  useEffect(() => {
    if (!interviewStarted || roteiro.length === 0) return;
    if (idx > roteiro.length - 1) return;

    const pergunta = roteiro[idx].pergunta;
    setChat(c => [...c, { sender: "Entrevistador", text: pergunta }]);
    setAwaitingResponse(false);
    setTranscript("");
    setRecognitionTranscript("");

    (async () => {
      await playTTS(pergunta);

      // introdução
      if (idx === 0) {
        setIdx(1);
        return;
      }

      // encerramento: toca TTS e não faz mais nada aqui
      if (idx === roteiro.length - 1) {
        return;
      }

      // perguntas reais: prompt e await
      await new Promise(r => setTimeout(r, 1500));
      setChat(c => [...c, { sender: "Entrevistador", text: "Por favor, responda agora." }]);
      await playTTS("Por favor, responda agora.");
      setAwaitingResponse(true);
    })();
  }, [interviewStarted, idx, roteiro]);

  // effect dedicado para redirecionar APÓS o encerramento e 2s de silêncio
  useEffect(() => {
    // só dispara no índice final
    if (!interviewStarted) return;
    if (idx !== roteiro.length - 1) return;

    // quando o TTS parar de tocar, aguarda mais 2s e navega
    if (!ttsPlaying) {
      const timer = setTimeout(() => {
        navigate("/feedback");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [idx, roteiro, ttsPlaying, navigate, interviewStarted]);

  // inicia entrevista
  const startInterview = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setInterviewStarted(true);
    } catch {
      alert("Permita câmera e microfone para continuar.");
    }
  };

  // envia resposta e avança índice
  const sendResponse = async () => {
    const answer = transcript.trim();
    if (!answer) return;
    setIsSending(true);

    if (micOn) stopRecognition();

    setChat(c => [...c, { sender: "Você", text: answer }]);

    // opcional: salvar apenas para perguntas reais
    if (idx > 1 && idx < roteiro.length - 1) {
      const stored = await localforage.getItem("roteiroEntrevista");
      if (stored) {
        const secs = ["inicio","meio","tecnicas","encerramento"];
        let offset = idx - 1;
        let secName = "encerramento";
        for (let sec of secs) {
          const len = stored[sec]?.length || 0;
          if (offset < len) {
            secName = sec;
            break;
          }
          offset -= len;
        }
        if (stored[secName]) {
          stored[secName][offset].resposta = answer;
          await localforage.setItem("roteiroEntrevista", stored);
        }
      }
    }

    setTranscript("");
    setRecognitionTranscript("");
    setAwaitingResponse(false);
    setIsSending(false);
    setIdx(i => i + 1);
  };

  return {
    videoRef,
    audioRef,
    micOn,
    toggleMic,
    camOn,
    setCamOn,
    chat,
    chatVisible,
    setChatVisible,
    transcript,
    setTranscript,
    sendResponse,
    isSending,
    startInterview,
    interviewStarted,
    userVisible: true,
  };
}
