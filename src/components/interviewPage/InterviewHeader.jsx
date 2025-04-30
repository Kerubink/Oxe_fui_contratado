// src/components/interviewPage/InterviewHeader.jsx
import React, { useState, useEffect } from "react";
import { ShieldCheck, Grid3X3, Circle } from "lucide-react";

const InterviewHeader = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const format = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <header className="flex items-center justify-between p-2 bg-neutral-900 text-white">
      <div className="flex items-center gap-2">
        <ShieldCheck size={20} />
        <span className="font-semibold">Sala segura, oxe!</span>
      </div>
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1 font-mono">
          <Circle size={12} className="text-red-500 animate-pulse" />
          <span className="animate-pulse">{format(seconds)}</span>
        </span>
        <button className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-lg transition">
          <Grid3X3 size={18} /> Visualização
        </button>
      </div>
    </header>
  );
};

export default InterviewHeader;
