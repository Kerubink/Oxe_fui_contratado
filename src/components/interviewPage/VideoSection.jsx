const VideoSection = ({ videoRef }) => (
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
);

export default VideoSection;