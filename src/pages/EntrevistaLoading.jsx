// src/pages/EntrevistaLoading.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gerarRoteiroEntrevista } from "../services/roteiroService";
import { Loader2 } from "lucide-react";  // ícone spinner tree-shakable :contentReference[oaicite:14]{index=14}

export default function EntrevistaLoading() {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    (async () => {
      try {
        await gerarRoteiroEntrevista();
        navigate("/video-check");
      } catch (err) {
        console.error("Erro ao gerar roteiro:", err);
        alert("Ocorreu um erro ao criar sua entrevista.");
      }
    })();
  }, [navigate]);

  return (
    <div 
      className="
        fixed inset-0
        bg-gradient-to-br from-gray-50 to-white
        flex items-center justify-center
      "
    >
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        {/* Spinner */}
        <Loader2 className="animate-spin w-16 h-16 text-blue-600 mx-auto mb-6" />
        
        {/* Skeleton lines */}
        <div className="space-y-4 mb-6">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6 mx-auto" />
        </div>
        
        {/* Mensagem */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Preparando sua entrevista personalizada...
        </h2>
        <p className="text-gray-500 mb-6">
          Estamos selecionando as melhores perguntas para você.
        </p>
        
        {/* Progress bar */}
        <div className="h-1 bg-blue-600 rounded-full animate-pulse w-1/2 mx-auto" />
      </div>
    </div>
  );
}
