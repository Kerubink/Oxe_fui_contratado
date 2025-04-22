// src/pages/InterviewScreen.jsx

import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Grid3x3,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  MessageSquare,
  Play,
} from "lucide-react";
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

  // Tela de início
  if (!interviewStarted) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-neutral-900 gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Simulador de Entrevista</h1>
          <p className="text-white/80">Clique abaixo para iniciar quando estiver pronto</p>
        </div>
        <button 
          onClick={startInterview}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition-all"
        >
          <Play size={28} />
          <span className="text-lg">Iniciar Simulação</span>
        </button>
        <div className="text-sm text-white/60 mt-4 flex items-center gap-2">
          <ShieldCheck size={18} />
          <span>Sua privacidade e segurança são importantes para nós</span>
        </div>
      </div>
    );
  }

  // Tela principal da entrevista
  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-900">
      <audio ref={audioRef} hidden />
      
      <header className="flex items-center justify-between p-2">
        <div className="flex items-center gap-1 text-white">
          <ShieldCheck />
          <span className="font-semibold">Sala segura, oxe!</span>
        </div>
        <button className="flex items-center gap-1 rounded-lg bg-blue-700 p-1.5 text-white hover:bg-blue-800">
          <Grid3x3 size={20} /> View
        </button>
      </header>

      <div className="flex flex-1 p-2">
        <div className="flex-1 flex items-center justify-center gap-4">
          <div className="flex flex-col items-center bg-gray-800 rounded-lg p-4 w-1/3">
            <img
              src="/entrevistador.jpg"
              alt="Entrevistador"
              className="w-32 h-32 rounded-full border-2 border-blue-500"
            />
            <span className="mt-2 text-white">Entrevistador</span>
          </div>
          
          <div className="flex flex-col items-center bg-gray-800 rounded-lg p-4 w-1/3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-32 h-32 bg-black rounded-lg"
            />
            <span className="mt-2 text-white">
              {localStorage.getItem("usuarioNome") || "Você"}
            </span>
          </div>
        </div>

        {chatVisible && (
          <div className="w-1/4 flex flex-col border-l border-gray-700 bg-neutral-800">
            <header className="bg-blue-800 p-2 text-white text-center">
              Chat da chamada
            </header>
            <div className="flex-1 overflow-y-auto p-2">
              {chat.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 flex ${msg.sender === "Você" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`inline-block rounded-lg px-3 py-1 ${
                      msg.sender === "Você" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    <strong className="block text-xs opacity-75">
                      {msg.sender}
                    </strong>
                    <span>{msg.text}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-neutral-700 p-2 flex flex-col">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
                className="w-full p-2 rounded resize-none mb-2"
                placeholder="Fale sua resposta..."
              />
              <button
                onClick={handleSend}
                disabled={isSending}
                className="bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSending ? "Enviando..." : "Enviar Resposta"}
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="relative bg-blue-950 flex justify-center items-center p-2 text-white">
        <div className="flex gap-8">
          <button onClick={toggleMic} className="flex flex-col items-center">
            {micOn ? <Mic size={24} /> : <MicOff size={24} />}
            <span>{micOn ? "Mic On" : "Mic Off"}</span>
          </button>
          <button
            onClick={() => setCamOn((c) => !c)}
            className="flex flex-col items-center"
          >
            {camOn ? <Camera size={24} /> : <CameraOff size={24} />}
            <span>{camOn ? "Cam On" : "Cam Off"}</span>
          </button>
        </div>
        <button
          onClick={() => setChatVisible((v) => !v)}
          className="absolute right-4 flex flex-col items-center"
        >
          <MessageSquare size={24} />
          <span>{chatVisible ? "Ocultar Chat" : "Mostrar Chat"}</span>
        </button>
      </footer>
    </div>
  );
}