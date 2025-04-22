import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import localforage from 'localforage';
import { gerarRoteiroEntrevista } from '../services/roteiroService';
import perguntasJson from '../../public/perguntas.json';

export default function EntrevistaLoading() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const perguntas = await fetch('/perguntas.json').then(r => r.json());
        await gerarRoteiroEntrevista(perguntas);
        navigate('/video-check');
      } catch (err) {
        console.error('Erro ao gerar roteiro:', err);
        alert('Ocorreu um erro ao criar sua entrevista.');
      }
    })();
  }, []);

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
