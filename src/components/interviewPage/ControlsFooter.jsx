import { MicOff, Mic, MessageSquare, Camera, CameraOff } from "lucide-react";

const ControlsFooter = ({
    micOn,
    camOn,
    chatVisible,
    toggleMic,
    setCamOn,
    setChatVisible
  }) => (
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
  );

  export default ControlsFooter;