// componentes/AvaliacaoCandidato.jsx
import React, { useState, useEffect } from 'react';
import FeedbackDetalhado from '../components/avaliacaoPage/FeedbackDetalhado';
import { avaliarCandidatoComGemini } from '../services/avaliacaoService';

export default function AvaliacaoCandidato() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await avaliarCandidatoComGemini();
        setData(result);
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="p-6 text-center">Carregando avaliação...</p>;
  if (erro)   return <p className="p-6 text-center text-red-500">{erro}</p>;

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">Avaliação do Candidato</h1>
      <FeedbackDetalhado
        score={data.score}
        feedbackComportamental={data.feedbackComportamental}
        feedbackSituacional={data.feedbackSituacional}
        feedbackTecnico={data.feedbackTecnico}
        feedbackExpectativa={data.feedbackExpectativa}
        recommendations={data.recommendations}
      />
    </div>
  );
}
