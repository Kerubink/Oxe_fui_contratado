// src/utils/tempoRespostaService.js

const traitMultiplicadores = {
    // Dominance
    assertivo: 0.9,
    decisivo: 0.9,
    direto: 0.9,
    competitivo: 0.9,
    pragmatico: 0.85,
    // Influence
    persuasivo: 0.95,
    entusiasta: 1.0,
    sociavel: 1.05,
    inspirador: 1.0,
    otimista: 1.05,
    // Steadiness
    paciente: 1.3,
    calmo: 1.2,
    empatico: 1.2,
    cooperativo: 1.2,
    dedicado: 1.1,
    // Conscientiousness
    analitico: 1.0,
    detalhista: 1.0,
    Metodico: 1.0,
    perfeccionista: 1.0,
    critico: 1.0,
    // Adicionais
    observador: 1.1,
    encorajador: 1.2,
    adaptavel: 1.0,
    colaborativa: 1.1,
    diplomatica: 1.1,
    curioso: 1.0,
    energetico: 0.95,
    orientado_a_resultados: 0.85
  };
  
  const tipoMultiplicadores = {
    apresentacao: 1.3,
    motivacional: 1.2,
    situacional: 1.4,
    tecnica_simples: 1.0,
    tecnica_complexa: 1.35,
    encerramento: 0.8
  };
  
  /**
   * Calcula tempo recomendado para resposta com base na pergunta, traits e tipo.
   * @param {string} pergunta - Texto da pergunta
   * @param {string[]} traits - Traits do entrevistador
   * @param {string} tipo - Tipo da pergunta (ex: 'apresentacao', 'tecnica_simples')
   * @returns {number} Tempo sugerido em segundos
   */
  export function calcularTempoParaResposta(pergunta, traits = [], tipo = 'tecnica_simples') {
    const numPalavras = pergunta.trim().split(/\s+/).length;
    const tempoBase = numPalavras * 0.9;
  
    const traitMults = traits.map((trait) =>
      traitMultiplicadores[trait.replaceAll(" ", "_")] || 1.0
    );
    const multTrait = traitMults.length
      ? traitMults.reduce((a, b) => a + b, 0) / traitMults.length
      : 1.0;
  
    const multTipo = tipoMultiplicadores[tipo] || 1.0;
  
    const tempoFinal = tempoBase * multTrait * multTipo;
  
    return Math.round(tempoFinal);
  }
  