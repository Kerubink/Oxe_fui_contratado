const VideoSection = ({ videoRef, userVisible }) => (
  <div className="flex-1 flex items-center justify-center gap-4">
    {/* Entrevistador */}
    <div className="flex flex-col items-center relative bg-gray-800 rounded-lg w-1/2 h-1/2">
      <img
        src="/entrevistador.jpg"
        alt="Entrevistador"
        className="w-full h-full object-cover rounded-lg"
      />
      <span className="p-1.5 bg-neutral-800 text-white absolute bottom-0 left-0">
        Entrevistador
      </span>
    </div>

    {/* Candidato */}
    <div className="flex flex-col items-center relative bg-gray-800 rounded-lg w-1/2 h-1/2">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full bg-black rounded-lg object-cover"
      />

      <span className="p-1.5 bg-neutral-800 text-white absolute bottom-0 left-0">
        {localStorage.getItem("usuarioNome") || "Você"}
      </span>
    </div>
  </div>
);

export default VideoSection;
