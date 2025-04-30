// src/components/interviewPage/ControlsFooter.jsx
import React from "react";
import {
  MicOff,
  Mic,
  MessageSquare,
  Camera,
  CameraOff,
  Tv,
  FileText,
  Settings,
  Volume2,
} from "lucide-react";

const ControlsFooter = ({
  micOn,
  camOn,
  chatVisible,
  toggleMic,
  setCamOn,
  setChatVisible,
}) => (
  <footer className="relative bg-blue-950 flex items-center justify-center p-2 text-white">
    {/* Decorativo à esquerda */}
    <div className="absolute left-4 flex gap-4 opacity-60">
      <button className="p-2 rounded-full hover:bg-white/10 transition"><Tv size={20} /></button>
      <button className="p-2 rounded-full hover:bg-white/10 transition"><FileText size={20} /></button>
      <button className="p-2 rounded-full hover:bg-white/10 transition"><Settings size={20} /></button>
    </div>

    {/* Controles principais */}
    <div className="flex gap-12">
      <button onClick={toggleMic} className="flex flex-col items-center space-y-1">
        {micOn ? <Mic size={28} /> : <MicOff size={28} />}
        <span className="text-sm">{micOn ? "Mic On" : "Mic Off"}</span>
      </button>
      <button
        onClick={() => setCamOn((c) => !c)}
        className="flex flex-col items-center space-y-1"
      >
        {camOn ? <Camera size={28} /> : <CameraOff size={28} />}
        <span className="text-sm">{camOn ? "Cam On" : "Cam Off"}</span>
      </button>
    </div>

    {/* Decorativo à direita */}
    <div className="absolute right-4 flex gap-4 opacity-60">
      <button className="p-2 rounded-full hover:bg-white/10 transition"><Volume2 size={20} /></button>
    </div>

    {/* Toggle do chat */}
    <button
      onClick={() => setChatVisible((v) => !v)}
      className="absolute right-20 flex flex-col items-center space-y-1"
    >
      <MessageSquare size={28} />
      <span className="text-sm">{chatVisible ? "Ocultar Chat" : "Mostrar Chat"}</span>
    </button>
  </footer>
);

export default ControlsFooter;
