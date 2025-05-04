// src/pages/AvaliacaoCandidato.jsx
import React, { useState, useEffect } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import FeedbackDetalhado from '../components/avaliacaoPage/FeedbackDetalhado'
import ScoreExplanation from '../components/avaliacaoPage/ScoreExplanation'
import { avaliarCandidatoComGemini } from '../services/avaliacaoService'

export default function AvaliacaoCandidato() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const result = await avaliarCandidatoComGemini()
        setData(result)
      } catch (err) {
        setErro(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
        <span className="ml-4 text-lg text-gray-700">Carregando avaliação...</span>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 text-lg">{erro}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Avaliação da Entrevista Simulada
          </h1>
          <p className="mt-2 text-gray-600">
            Suas pontuações, explicações e orientações para evoluir.
          </p>
        </header>

        {/* Scores e Explicações */}
        <section className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Pontuações</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Técnica */}
            <div className="text-center">
              <p className="text-gray-500">Técnica</p>
              <p className="text-4xl font-extrabold text-blue-600">
                {data.scoreTecnico.toFixed(1)}/10
              </p>
              <ScoreExplanation text={data.explanationTecnico} />
            </div>
            {/* Afinidade */}
            <div className="text-center">
              <p className="text-gray-500">Afinidade</p>
              <p className="text-4xl font-extrabold text-green-600">
                {data.scoreAfinidade.toFixed(1)}/10
              </p>
              <ScoreExplanation text={data.explanationAfinidade} />
            </div>
            {/* Geral */}
            <div className="text-center">
              <p className="text-gray-500">Geral</p>
              <p className="text-4xl font-extrabold text-indigo-600">
                {data.scoreGeral.toFixed(1)}/10
              </p>
              <ScoreExplanation text={data.explanationGeral} />
            </div>
          </div>
        </section>

        {/* Feedback Detalhado */}
        <FeedbackDetalhado
          feedbackComportamental={data.feedbackComportamental}
          feedbackSituacional={data.feedbackSituacional}
          feedbackTecnico={data.feedbackTecnico}
          feedbackExpectativa={data.feedbackExpectativa}
          recommendations={data.recommendations}
        />
      </div>
    </div>
  )
}
