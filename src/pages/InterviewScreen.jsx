// src/pages/InterviewScreen.jsx

import { useState, useEffect, useRef } from "react";
import StartScreen from "../components/interviewPage/StartScreen";
import InterviewHeader from "../components/interviewPage/InterviewHeader";
import VideoSection from "../components/interviewPage/VideoSection";
import ChatPanel from "../components/interviewPage/ChatPanel";
import ControlsFooter from "../components/interviewPage/ControlsFooter";
import localforage from "localforage";

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
  
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // Inicializa STT e carrega roteiro
  useEffect(() => {
    if (!interviewStarted) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recog = new SR();
      recog.lang = "pt-BR";
      recog.continuous = true;
      recog.interimResults = true;
      recog.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) {
            setTranscript(prev => prev + res[0].transcript.trim() + " ");
          } else {
            interim += res[0].transcript;
          }
        }
        if (interim) setTranscript(prev => prev + interim);
      };
      recog.onend = () => micOn && recog.start();
      recognitionRef.current = recog;
    }

    // Carrega roteiro
    (async () => {
      const r = await localforage.getItem("roteiroEntrevista");
      if (r) setRoteiro([...r.inicio, ...r.meio, ...r.tecnicas, ...r.encerramento]);
    })();
  }, [interviewStarted]);

  // Função para iniciar a entrevista
  const startInterview = async () => {
    try {
      // Solicitar permissão de mídia
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setInterviewStarted(true);
      
      // Iniciar vídeo
      if (videoRef.current) {
        videoRef.current.play().catch(console.error);
      }
    } catch (error) {
      console.error('Permissão negada:', error);
      alert('Por favor, permita acesso à câmera e microfone!');
    }
  };

  // Função para reproduzir áudio usando Google TTS
  const playTTS = async (text) => {
    try {
      if (!text || !interviewStarted) return;

      // Limitar texto para 200 caracteres
      const limitedText = text.slice(0, 200);

      // Chamar a API local
      const response = await fetch(`/api/tts?text=${encodeURIComponent(limitedText)}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      // Criar blob de áudio
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Parar áudio anterior e reproduzir novo
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      
      await audioRef.current.play().catch(err => {
        console.error('Erro na reprodução:', err);
        alert('Clique na tela para permitir áudio!');
      });

    } catch (error) {
      console.error('Erro no TTS:', error);
      alert('Erro ao carregar áudio. Tente novamente.');
    }
  };

  // Dispara TTS ao mudar de pergunta
  useEffect(() => {
    if (!roteiro || idx >= roteiro.length) return;

    const handleQuestion = async () => {
      const pergunta = roteiro[idx].pergunta;
      pushChat("Entrevistador", pergunta);
      await playTTS(pergunta);
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setMicOn(true);
      }
      setTranscript("");
    };

    handleQuestion();
  }, [roteiro, idx]);

  // Configura câmera
  useEffect(() => {
    if (!interviewStarted) return;

    if (camOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((s) => (videoRef.current.srcObject = s))
        .catch(console.error);
    } else {
      const s = videoRef.current.srcObject;
      s?.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  }, [camOn, interviewStarted]);

  // Funções auxiliares
  const pushChat = (sender, text) =>
    setChat((c) => [...c, { sender, text }]);

  const handleSend = () => {
    if (isSending || !transcript.trim()) return;
    setIsSending(true);

    const txt = transcript.trim();
    recognitionRef.current?.stop();
    setMicOn(false);
    pushChat("Você", txt);
    setIdx((i) => i + 1);
    setIsSending(false);
  };

  const toggleMic = () => {
    if (micOn) {
      recognitionRef.current?.stop();
      setMicOn(false);
      handleSend();
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setMicOn(true);
    }
  };

  return (
    <>
      {!interviewStarted ? (
        <StartScreen onStart={startInterview} />
      ) : (
        <div className="h-screen w-screen flex flex-col bg-neutral-900">
          <audio ref={audioRef} hidden />
          
          <InterviewHeader />
          
          <div className="flex flex-1 p-2">
            <VideoSection videoRef={videoRef} />
            
            <ChatPanel
              chatVisible={chatVisible}
              chat={chat}
              transcript={transcript}
              isSending={isSending}
              setTranscript={setTranscript}
              handleSend={handleSend}
            />
          </div>

          <ControlsFooter
            micOn={micOn}
            camOn={camOn}
            chatVisible={chatVisible}
            toggleMic={toggleMic}
            setCamOn={setCamOn}
            setChatVisible={setChatVisible}
          />
        </div>
      )}
    </>
  );
}