// componentes/FeedbackDetalhado.jsx
import React from 'react';

export default function FeedbackDetalhado({
  score,
  feedbackComportamental = [],
  feedbackSituacional = [],
  feedbackTecnico = [],
  feedbackExpectativa = [],
  recommendations = []
}) {
  const Section = ({ title, items }) => (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        {items.length > 0
          ? items.map((item, idx) => <li key={idx}>{item}</li>)
          : <li className="italic text-gray-400">Nenhum item disponível.</li>
        }
      </ul>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Score geral */}
      <div className="text-center bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Score Geral</h2>
        <p className="text-5xl font-extrabold">{score !== null ? score : '--'}</p>
      </div>

      {/* Feedback por categoria */}
      <Section title="Feedback Comportamental" items={feedbackComportamental} />
      <Section title="Feedback Situacional"    items={feedbackSituacional}    />
      <Section title="Feedback Técnico"        items={feedbackTecnico}         />
      <Section title="Feedback de Expectativa"  items={feedbackExpectativa}     />

      {/* Recomendações */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Recomendações</h3>
        <ul className="list-decimal list-inside space-y-2 text-gray-700">
          {recommendations.length > 0
            ? recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)
            : <li className="italic text-gray-400">Sem recomendações.</li>
          }
        </ul>
      </div>
    </div>
  );
}
