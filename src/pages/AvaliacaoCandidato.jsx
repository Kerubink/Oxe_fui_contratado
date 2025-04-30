// src/pages/AvaliacaoCandidato.jsx

import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
        <span className="ml-4 text-lg text-gray-700">Carregando avaliação...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 text-lg">{erro}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Avaliação do Candidato</h1>
          <p className="mt-2 text-gray-600">
            Aqui está o seu feedback detalhado e recomendações de melhoria.
          </p>
        </header>

        {/* Score Section */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pontuação Geral</h2>
          <div className="flex justify-center">
            <div className="relative">
              <div className="text-6xl font-extrabold text-blue-600">{data.score}</div>
              <span className="absolute inset-x-0 bottom-0 text-center text-gray-500">/10</span>
            </div>
          </div>
        </section>

        {/* Detailed Feedback */}
        <FeedbackDetalhado
          feedbackComportamental={data.feedbackComportamental}
          feedbackSituacional={data.feedbackSituacional}
          feedbackTecnico={data.feedbackTecnico}
          feedbackExpectativa={data.feedbackExpectativa}
          recommendations={data.recommendations}
        />
      </div>
    </div>
  );
}
