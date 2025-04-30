// src/components/avaliacaoPage/FeedbackDetalhado.jsx

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Section = ({ title, items }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 hover:bg-gray-200 focus:outline-none"
      >
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        {open 
          ? <ChevronUp className="w-5 h-5 text-gray-600" /> 
          : <ChevronDown className="w-5 h-5 text-gray-600" />
        }
      </button>
      {open && (
        <ul className="px-6 py-4 space-y-2">
          {items.map((txt, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
              <p className="text-gray-700">{txt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function FeedbackDetalhado({
  feedbackComportamental = [],
  feedbackSituacional = [],
  feedbackTecnico = [],
  feedbackExpectativa = [],
  recommendations = [],
}) {
  return (
    <div className="space-y-6">
      <Section title="Feedback Comportamental" items={feedbackComportamental} />
      <Section title="Feedback Situacional"   items={feedbackSituacional} />
      <Section title="Feedback Técnico"        items={feedbackTecnico} />
      <Section title="Feedback de Expectativas" items={feedbackExpectativa} />

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Recomendações Gerais</h3>
        <ul className="space-y-2">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1 w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
              <p className="text-gray-700">{rec}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
