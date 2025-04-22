// Corrija o arquivo StartScreen.jsx adicionando os imports
import { Play, ShieldCheck } from "lucide-react"; // Importe os ícones usados

const StartScreen = ({ onStart }) => (
  <div className="h-screen flex flex-col items-center justify-center bg-neutral-900 gap-6">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-white mb-2">Simulador de Entrevista</h1>
      <p className="text-white/80">Clique abaixo para iniciar quando estiver pronto</p>
    </div>
    <button 
      onClick={onStart}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition-all"
    >
      <Play size={28} /> {/* Agora o ícone está importado */}
      <span className="text-lg">Iniciar Simulação</span>
    </button>
    <div className="text-sm text-white/60 mt-4 flex items-center gap-2">
      <ShieldCheck size={18} /> {/* Ícone já importado */}
      <span>Sua privacidade e segurança são importantes para nós</span>
    </div>
  </div>
);

export default StartScreen;