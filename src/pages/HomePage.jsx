// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Users, Code, MessageCircle, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      {/* Hero Section */}
      <section className="max-w-2xl text-center space-y-4">
        {/* Logo / Nome do Projeto */}
        <h1 className="text-5xl font-extrabold text-gray-900">
          Oxe, <span className="text-blue-600">fui contratado!</span>
        </h1>
        {/* Badge “Gratuito para Comunidade” */}
        <div className="inline-flex items-center bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
          <Heart size={16} className="mr-2" />
          100% Grátis e Open Source
        </div>
        {/* Tagline */}
        <p className="text-lg text-gray-700">
          Simulador de entrevistas com IA e feedback em tempo real — totalmente gratuito para a comunidade praticar e se preparar.
        </p>
        {/* Call to Action */}
        <Link
          to="/config"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
        >
          Experimente Grátis Agora
        </Link>
      </section>

      {/* Features Section */}
      <section className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl w-full">
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow">
          <Users size={48} className="text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-center">Experiência Realista</h3>
          <p className="text-gray-600 text-center">
            Interface que simula chamadas de vídeo, com indicador de quem fala e layout responsivo.
          </p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow">
          <Code size={48} className="text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-center">Perguntas Personalizadas</h3>
          <p className="text-gray-600 text-center">
            A IA gera perguntas para você, adaptadas ao seu perfil, cargo e empresa alvo.
          </p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow">
          <MessageCircle size={48} className="text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-center">Feedback Detalhado</h3>
          <p className="text-gray-600 text-center">
            Receba pontuações e dicas de melhoria técnica e comportamental após cada resposta.
          </p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow">
          <Heart size={48} className="text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-center">Gratuito para Comunidade</h3>
          <p className="text-gray-600 text-center">
            Plataforma open source e sem custos, feita para você praticar sem barreiras.
          </p>
        </div>
      </section>
    </div>
  );
}
