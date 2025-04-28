// src/utils/tempoRespostaService.js
const TEMPO_BASE_POR_TIPO = {
  comportamental: 90,    // Perguntas sobre experiência e comportamento
  situacional: 120,      // Cenários hipotéticos
  tecnica_simples: 120,  // Conceitos básicos
  tecnica_complexa: 180, // Problemas profundos
  logistica: 60,         // Disponibilidade/condições
  encerramento: 60       // Considerações finais
};

const MULTIPLICADORES_TRAITS = {
  // Dominância - Exigem objetividade
  assertivo: 0.85,
  decisivo: 0.9,
  orientado_a_resultados: 0.8,

  // Influência - Valorizam storytelling
  persuasivo: 1.1,
  entusiasta: 1.15,
  comunicativo: 1.05,

  // Estabilidade - Preferem detalhes
  paciente: 1.25,
  analitico: 1.3,
  detalhista: 1.4,

  // Adicionais
  perfeccionista: 1.35,
  curioso: 1.2,
  colaborativo: 1.1
};

const PALAVRAS_CHAVE_COMPLEXIDADE = {
  'descreva': 1.25,
  'explique': 1.35,
  'justifique': 1.4,
  'detalhe': 1.3,
  'como você': 1.2,
  'por que': 1.15
};

export function calcularTempoParaResposta(pergunta, traits = [], tipo = 'tecnica_simples') {
  // 1. Tempo base por tipo de pergunta
  let tempo = TEMPO_BASE_POR_TIPO[tipo] || 90;

  // 2. Ajuste por palavras-chave de complexidade
  const palavras = pergunta.toLowerCase().split(' ');
  for (const [key, mult] of Object.entries(PALAVRAS_CHAVE_COMPLEXIDADE)) {
    if (palavras.includes(key)) {
      tempo *= mult;
      break; // Considera apenas a primeira palavra-chave encontrada
    }
  }

  // 3. Combinação de multiplicadores de traits (multiplicativa)
  let multTraits = 1;
  traits.forEach(trait => {
    multTraits *= MULTIPLICADORES_TRAITS[trait] || 1;
  });

  // 4. Aplicar limites realistas
  tempo = Math.min(Math.max(tempo * multTraits, 60), 300); // Entre 1 e 5 minutos

  return Math.round(tempo);
}