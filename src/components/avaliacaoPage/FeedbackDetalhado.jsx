// src/components/avaliacaoPage/FeedbackDetalhado.jsx

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Componente genérico de seção expansível
const CollapsibleSection = ({ title, items, colorClass = 'bg-blue-600' }) => {
  const [open, setOpen] = useState(true);
  // gera um ID único a partir do título para aria-controls
  const id = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <section className="bg-white shadow rounded-lg overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(old => !old)}
        className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
      >
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        {open
          ? <ChevronUp className="w-5 h-5 text-gray-600" />
          : <ChevronDown className="w-5 h-5 text-gray-600" />
        }
      </button>

      {open && (
        <ul
          id={id}
          className="px-6 py-4 space-y-2"
          role="region"
          aria-labelledby={id + '-button'}
        >
          {items.length > 0
            ? items.map((txt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={`mt-1 w-2 h-2 ${colorClass} rounded-full flex-shrink-0`}
                    aria-hidden="true"
                  />
                  <p className="text-gray-700">{txt}</p>
                </li>
              ))
            : (
              <li className="text-gray-500 italic">
                Nenhum item disponível nesta seção.
              </li>
            )
          }
        </ul>
      )}
    </section>
  );
};

export default function FeedbackDetalhado({
  feedbackComportamental = [],
  feedbackSituacional     = [],
  feedbackTecnico         = [],
  feedbackExpectativa     = [],
  recommendations         = [],
}) {
  return (
    <div className="space-y-6">
      <CollapsibleSection
        title="Feedback Comportamental"
        items={feedbackComportamental}
        colorClass="bg-purple-500"
      />
      <CollapsibleSection
        title="Feedback Situacional"
        items={feedbackSituacional}
        colorClass="bg-yellow-500"
      />
      <CollapsibleSection
        title="Feedback Técnico"
        items={feedbackTecnico}
        colorClass="bg-blue-600"
      />
      <CollapsibleSection
        title="Feedback de Expectativa"
        items={feedbackExpectativa}
        colorClass="bg-indigo-500"
      />

      <CollapsibleSection
        title="Recomendações Gerais"
        items={recommendations}
        colorClass="bg-green-500"
      />
    </div>
  );
}
