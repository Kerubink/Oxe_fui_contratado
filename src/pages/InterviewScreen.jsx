import {
  ShieldCheck,
  Grid3x3,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  MessageSquare,
} from "lucide-react";

const InterviewScreen = () => {
  return (
    <div className="h-screen w-screen flex flex-col justify-between bg-neutral-900">
      <header className="flex items-center justify-between p-2">
        <div className="flex gap-1">
          <ShieldCheck className="text-blue-500" />
          <span className="font-semibold text-white">Sala segura, oxe!</span>
        </div>
        <button className="flex justify-center items-center rounded-lg gap-1 text-white bg-blue-700 p-1.5 hover:bg-blue-800">
          <Grid3x3 size={20} />
          View
        </button>
      </header>
      <div className="flex-1 flex justify-between rounded-lg shadow-lg">
        <div className="flex-1 rounded-lg gap-1 p-2 flex items-center justify-center">
          <div className="w-1/2 h-1/2 flex flex-col items-center justify-between bg-amber-100">
            foto do entrevistador
            <footer className="w-full">
              <span className="bg-neutral-800 p-1 text-white">
                nome do entrevistador
              </span>
            </footer>
          </div>
          <div className="w-1/2 h-1/2 flex flex-col items-center justify-between bg-amber-100">
            camera do candidato
            <footer className="w-full">
              <span className="bg-neutral-800 p-1 text-white">
                nome do candidato
              </span>
            </footer>
          </div>
        </div>
        <div className="w-1/5 border-2 border-dashed border-gray-300 text-amber-50">
          chat
        </div>
      </div>
      <footer className="relative bg-blue-950 flex justify-center items-center text-white p-2">
        <div className="flex gap-5">
          <button className="flex flex-col items-center">
            <Mic />
            <span>Fone</span>
            {/* <span>Mutado</span> se o microfone for desativado */}
            {/* <MicOff /> se o microfone for desativado  */}
          </button>
          <button className="flex flex-col items-center">
            <Camera />
            <span>Câmera</span>
            {/* <span>Ligar Cam.</span> se a camera for desligada  */}
            {/* <CameraOff /> se a camera for desligada*/}
          </button>
        </div>

        <button className="flex flex-col items-center absolute right-3">
          <MessageSquare />
          <span>chat</span>
        </button>
      </footer>
    </div>
  );
};

export default InterviewScreen;
