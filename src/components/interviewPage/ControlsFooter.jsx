import React, { useEffect, useRef, useState } from "react";
import {
  MicOff,
  Mic,
  MessageSquare,
  Camera,
  CameraOff,
  LogOut,
  Users,
  ShieldPlus,
  AlarmClock,
} from "lucide-react";
import localforage from "localforage";

const ControlsFooter = ({
  micOn,
  camOn,
  chatVisible,
  toggleMic,
  setCamOn,
  setChatVisible,
  toggleTimerVisibility,
}) => {
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const [participantName, setParticipantName] = useState("Você (candidato)");
  const [interviewerName, setInterviewerName] = useState("Entrevistador");

  const securityRef = useRef(null);
  const participantsRef = useRef(null);

  // Detecta clique fora dos dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        securityRef.current &&
        !securityRef.current.contains(e.target)
      ) {
        setShowSecurityInfo(false);
      }
      if (
        participantsRef.current &&
        !participantsRef.current.contains(e.target)
      ) {
        setShowParticipantsList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Carrega nomes do localStorage e localforage
  useEffect(() => {
    const nomeCandidato = localStorage.getItem("usuarioNome");
    if (nomeCandidato) setParticipantName(`👤 ${nomeCandidato}`);

    localforage.getItem("fichaEntrevista").then((data) => {
      if (data?.interviewer?.name) {
        setInterviewerName(`👤 ${data.interviewer.name}`);
      }
    });
  }, []);

  return (
    <footer className="relative bg-blue-950 flex items-center justify-between px-6 py-2 text-white">
      <div className="flex gap-10">
        {/* MIC */}
        <button onClick={toggleMic} className="flex flex-col items-center space-y-1 p-2 hover:bg-white/10 rounded-lg transition">
          {micOn ? <Mic size={28} /> : <MicOff size={28} />}
          <span className="text-sm">{micOn ? "Mic On" : "Mic Off"}</span>
        </button>

        {/* CAMERA */}
        <button onClick={() => setCamOn((c) => !c)} className="flex flex-col items-center space-y-1 p-2 hover:bg-white/10 rounded-lg transition">
          {camOn ? <Camera size={28} /> : <CameraOff size={28} />}
          <span className="text-sm">{camOn ? "Cam On" : "Cam Off"}</span>
        </button>
      </div>

      <div className="flex gap-6 items-center opacity-90">
        {/* SEGURANÇA */}
        <div className="relative" ref={securityRef}>
          <button
            onClick={() => setShowSecurityInfo((v) => !v)}
            className="flex flex-col items-center space-y-1 p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ShieldPlus size={28} />
            <span className="text-sm">Segurança</span>
          </button>
          {showSecurityInfo && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 bg-white text-gray-900 p-3 rounded-lg shadow-lg text-sm z-10">
              <strong>Privacidade:</strong><br />
              Este sistema <strong>não armazena</strong> dados pessoais<br />
              além do currículo e respostas.<br />
              Tudo permanece no seu navegador.
            </div>
          )}
        </div>

        {/* CHAT */}
        <button
          onClick={() => setChatVisible((v) => !v)}
          className="flex flex-col items-center space-y-1 p-2 hover:bg-white/10 rounded-lg transition"
        >
          <MessageSquare size={28} />
          <span className="text-sm">{chatVisible ? "Ocultar Chat" : "Mostrar Chat"}</span>
        </button>

        {/* PARTICIPANTES */}
        <div className="relative" ref={participantsRef}>
          <button
            onClick={() => setShowParticipantsList((v) => !v)}
            className="flex flex-col items-center space-y-1 p-2 hover:bg-white/10 rounded-lg transition"
          >
            <Users size={28} />
            <span className="text-sm">Pessoas</span>
          </button>
          {showParticipantsList && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 bg-white text-gray-900 p-3 rounded-lg shadow-lg text-sm z-10">
              <div>Participantes:</div>
              <ul className="space-y-1">
                <li>{participantName} (Você)</li>
                <li>{interviewerName}</li>
              </ul>
            </div>
          )}
        </div>

        {/* TEMPO */}
        <button
          onClick={toggleTimerVisibility}
          className="flex flex-col items-center space-y-1 p-2 hover:bg-white/10 rounded-lg transition"
        >
          <AlarmClock size={28} />
          <span className="text-sm">Tempo</span>
        </button>
      </div>

      <button
          className="flex flex-col items-center space-y-1 p-2 hover:bg-white/10 hover:text-red-500 rounded-lg transition"
        >
          <LogOut size={28}/>
          <span className="text-sm">Sair</span>
        </button>
    </footer>
  );
};

export default ControlsFooter;
