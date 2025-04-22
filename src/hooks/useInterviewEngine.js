import { useEffect, useRef, useState } from "react";
import localforage from "localforage";

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export function useInterviewEngine() {
  const [roteiro, setRoteiro] = useState(null);
  const [idx, setIdx] = useState(0);
  const [chat, setChat] = useState([]);
  const [chatVisible, setChatVisible] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // Inicializa reconhecimento de voz e carrega roteiro
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
      if (micOn && awaitingResponse && !ttsPlaying) {
        rec.start();
      }
    };

    rec.onerror = (err) => {
      console.error("STT error:", err);
      setMicOn(false);
    };

    recognitionRef.current = rec;
  }, []);

  // Carrega roteiro da entrevista ao iniciar
  useEffect(() => {
    if (!interviewStarted) return;

    (async () => {
      const stored = await localforage.getItem("roteiroEntrevista");
      if (stored) {
        setRoteiro([
          ...stored.inicio,
          ...stored.meio,
          ...stored.tecnicas,
          ...stored.encerramento,
        ]);
      }
    })();
  }, [interviewStarted]);

  // Controla STT
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

  // Controla câmera
  useEffect(() => {
    if (!interviewStarted) return;

    if (camOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(console.error);
    } else {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [camOn, interviewStarted]);

  // TTS (Text-to-Speech)
  const playTTS = async (text) => {
    setTtsPlaying(true);
    try {
      const snippet = encodeURIComponent(text.slice(0, 200));
      const res = await fetch(`/api/tts?text=${snippet}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      await new Promise((resolve, reject) => {
        audio.addEventListener("ended", resolve, { once: true });
        audio.addEventListener("error", reject, { once: true });
        audio.play().catch(reject);
      });
    } catch {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      speechSynthesis.speak(u);
      await new Promise((r) => { u.onend = r; });
    }
    setTtsPlaying(false);
  };

  // Quando mudar a pergunta
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

  // Enviar resposta
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

  const toggleMic = () => {
    micOn ? sendResponse() : setMicOn(true);
  };

  const startInterview = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setInterviewStarted(true);
    } catch {
      alert("Permita câmera e microfone para continuar.");
    }
  };

  return {
    videoRef,
    audioRef,
    micOn,
    camOn,
    setCamOn,
    chat,
    chatVisible,
    setChatVisible,
    transcript,
    setTranscript,
    toggleMic,
    sendResponse,
    isSending,
    startInterview,
    interviewStarted,
  };
}
