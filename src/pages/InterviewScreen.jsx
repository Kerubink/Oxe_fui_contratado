// src/pages/InterviewScreen.jsx
import { useState, useEffect, useRef } from "react";
import StartScreen from "../components/interviewPage/StartScreen";
import InterviewHeader from "../components/interviewPage/InterviewHeader";
import VideoSection from "../components/interviewPage/VideoSection";
import ChatPanel from "../components/interviewPage/ChatPanel";
import ControlsFooter from "../components/interviewPage/ControlsFooter";
import localforage from "localforage";

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function InterviewScreen() {
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

  // 1) Monta SpeechRecognition mas não inicia
  useEffect(() => {
    if (!interviewStarted || !SR) return;
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
      // só reinicia se o usuário ainda quiser transcrever
      if (micOn && awaitingResponse && !ttsPlaying) rec.start();
    };
    rec.onerror = (err) => {
      console.error("STT error:", err);
      setMicOn(false);
    };
    recognitionRef.current = rec;

    // carrega roteiro
    (async () => {
      const stored = await localforage.getItem("roteiroEntrevista");
      if (stored) {
        setRoteiro([
          ...stored.inicio,
          ...stored.meio,
          ...stored.tecnicas,
          ...stored.encerramento
        ]);
      }
    })();
  }, [interviewStarted]);

  // 2) Controla o STT **só** quando o usuário ativa o mic 
  //     e TTS já terminou (awaitingResponse)
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

  // 3) TTS que aguarda a API e sinaliza quando termina
  const playTTS = async (text) => {
    setTtsPlaying(true);
    const snippet = encodeURIComponent(text.slice(0, 200));
    const res = await fetch(`/api/tts?text=${snippet}`);
    if (!res.ok) throw new Error("TTS error");
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
    setTtsPlaying(false);
  };

  // 4) Dispara pergunta via chat + TTS, depois libera resposta
  useEffect(() => {
    if (!roteiro || idx >= roteiro.length) return;
    (async () => {
      const pergunta = roteiro[idx].pergunta;
      setChat(c => [...c, { sender: "Entrevistador", text: pergunta }]);
      setAwaitingResponse(false);
      setMicOn(false);
      setTranscript("");

      try {
        await playTTS(pergunta);
      } catch {
        const u = new SpeechSynthesisUtterance(pergunta);
        u.lang = "pt-BR";
        speechSynthesis.speak(u);
        await new Promise(r => { u.onend = r; });
      }

      // agora liberamos o STT: usuário precisa clicar 
      setAwaitingResponse(true);
    })();
  }, [roteiro, idx]);

  // 5) Toggle câmera
  useEffect(() => {
    if (!interviewStarted) return;
    if (camOn) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => videoRef.current.srcObject = s)
        .catch(console.error);
    } else {
      videoRef.current.srcObject?.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  }, [camOn, interviewStarted]);

  // 6) Envia resposta ao desligar mic ou botão manual
  const sendResponse = async () => {
    if (isSending) return;
    const ans = transcript.trim();
    if (!ans) return;
    setIsSending(true);
    setMicOn(false);

    setChat(c => [...c, { sender: "Você", text: ans }]);

    const stored = await localforage.getItem("roteiroEntrevista");
    if (stored) {
      const lenI = stored.inicio.length,
            lenM = stored.meio.length,
            lenT = stored.tecnicas.length;
      let phase, li;
      if (idx < lenI) { phase = "inicio"; li = idx; }
      else if (idx < lenI+lenM) { phase = "meio"; li = idx - lenI; }
      else if (idx < lenI+lenM+lenT) { phase = "tecnicas"; li = idx - lenI - lenM; }
      else { phase = "encerramento"; li = idx - lenI - lenM - lenT; }
      stored[phase][li].resposta = ans;
      await localforage.setItem("roteiroEntrevista", stored);
    }

    setIdx(i => i+1);
    setIsSending(false);
  };

  // 7) Handler do botão de mic
  const onMicToggle = () => {
    if (micOn) {
      sendResponse();
    } else {
      setMicOn(true);
    }
  };

  // 8) Inicia a simulação
  const startInterview = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setInterviewStarted(true);
    } catch {
      alert("Permita câmera e microfone para continuar.");
    }
  };

  // Render
  if (!interviewStarted) return <StartScreen onStart={startInterview} />;

  return (
    <div className="h-screen flex flex-col bg-neutral-900">
      <audio ref={audioRef} hidden />
      <InterviewHeader />
      <div className="flex flex-1 p-2">
        <VideoSection videoRef={videoRef} />
        <ChatPanel
          chatVisible={chatVisible}
          chat={chat}
          transcript={transcript}
          setTranscript={setTranscript}
          handleSend={sendResponse}
          isSending={isSending}
        />
      </div>
      <ControlsFooter
        micOn={micOn}
        camOn={camOn}
        chatVisible={chatVisible}
        toggleMic={onMicToggle}
        setCamOn={setCamOn}
        setChatVisible={setChatVisible}
      />
    </div>
  );
}
