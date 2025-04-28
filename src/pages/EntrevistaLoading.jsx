import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gerarRoteiroEntrevista } from '../services/roteiroService';

export default function EntrevistaLoading() {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;       // se já rodou, sai
    hasRun.current = true;            // marca como executado

    (async () => {
      try {
        await gerarRoteiroEntrevista();  // única chamada garantida
        navigate('/video-check');
      } catch (err) {
        console.error('Erro ao gerar roteiro:', err);
        alert('Ocorreu um erro ao criar sua entrevista.');
      }
    })();
  }, [navigate]); // só dispara uma vez

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Preparando sua entrevista personalizada...</h2>
        <p className="text-gray-500">Estamos selecionando as melhores perguntas para você.</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
