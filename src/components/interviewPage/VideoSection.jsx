// src/components/interviewPage/VideoSection.jsx
import React, { useState, useEffect } from "react";
import localforage from "localforage";

const VideoSection = ({
  videoRef,
  userVisible,
  interviewerSpeaking,
  candidateSpeaking,
  chatVisible,
}) => {
  const [interviewerImg, setInterviewerImg] = useState(null);
    const [interviewerName, setInterviewerName] = useState("Entrevistador");
  

  // Ao montar, busca a fichaEntrevista e extrai a URL da imagem
  useEffect(() => {
    let mounted = true;
    localforage.getItem("fichaEntrevista")
      .then(ficha => {
        if (!mounted) return;
        const img = ficha?.interviewer?.img;
        setInterviewerImg(img || "/placeholder-entrevistador.png");
      })
      .catch(() => {
        if (mounted) setInterviewerImg("/placeholder-entrevistador.png");
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    localforage.getItem("fichaEntrevista").then((data) => {
      if (data?.interviewer?.name) {
        setInterviewerName(`${data.interviewer.name}`);
      }
    });
  }, []);

  // Determina a largura com base em chatVisible
  const widthClass = chatVisible
    ? "w-[calc(100%-20rem)]"
    : "w-full";

  return (
    <div className={`
        ${widthClass} h-full flex flex-col md:flex-row
        items-center justify-center gap-4 p-2
        transition-all duration-300
      `}
    >
      {/* Entrevistador */}
      <div className={`
          relative bg-gray-800 rounded-lg overflow-hidden
          w-full md:w-1/2 aspect-video
          border-2 transition-all duration-300
          ${interviewerSpeaking
            ? "border-blue-500 animate-pulse"
            : "border-transparent"}
        `}
      >
        <img
          src={interviewerImg}
          alt="Foto do Entrevistador"
          className="object-cover w-full h-full"
        />
        <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        {interviewerName}
        </span>
      </div>

      {/* Candidato */}
      <div className={`
          relative bg-gray-800 rounded-lg overflow-hidden
          w-full md:w-1/2 aspect-video
          border-2 transition-all duration-300
          ${candidateSpeaking
            ? "border-blue-500 animate-pulse"
            : "border-transparent"}
        `}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!userVisible}
          className="object-cover w-full h-full bg-black"
        />
        <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {localStorage.getItem("usuarioNome") || "Você"}
        </span>
      </div>
    </div>
  );
};

export default VideoSection;
