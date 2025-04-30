// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Users, Code, MessageCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      {/* Hero Section */}
      <section className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-gray-900">
          <span className="block">Simulador de Entrevistas</span>
          <span className="block text-blue-600 mt-2">Com IA e Feedback em Tempo Real</span>
        </h1>
        <p className="text-lg text-gray-700">
          Pratique perguntas comportamentais, situacionais e técnicas num ambiente que simula uma videoconferência real. Receba avaliações detalhadas e melhore seus pontos fracos antes da entrevista de verdade.
        </p>
        <Link
          to="/config"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
        >
          Começar Agora
        </Link>
      </section>

      {/* Features Section */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow">
          <Users size={48} className="text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Experiência Realista</h3>
          <p className="text-gray-600 text-center">
            Interface semelhante ao Zoom/Teams, com indicadores de quem está falando e layout responsivo.  
          </p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow">
          <Code size={48} className="text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Perguntas Personalizadas</h3>
          <p className="text-gray-600 text-center">
            A IA gera 8 perguntas sob medida para seu perfil, cargo e empresa, cobrindo aspectos comportamentais, situacionais e técnicos.  
          </p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow">
          <MessageCircle size={48} className="text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Feedback Detalhado</h3>
          <p className="text-gray-600 text-center">
            Avaliação em tempo real com pontuação, feedback técnico e dicas de melhoria para cada resposta.  
          </p>
        </div>
      </section>
    </div>
);
}
