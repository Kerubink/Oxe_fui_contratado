// src/services/roteiroService.js

import localforage from 'localforage';
import { sortearPerguntaPorTrait } from '../utils/sorteioPorTrait';
import { calcularTempoParaResposta } from '../utils/tempoRespostaService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_A_KEY;

/**
 * Gera exatamente 2 perguntas técnicas em uma única chamada à API Gemini.
 */
async function gerarPerguntasTecnicas({ cv, vaga, perfil }) {
  const prompt = `
Você é um entrevistador técnico. Gere exatamente 2 perguntas específicas para esta entrevista.
Use apenas as perguntas, sem explicações ou comentários.

Resumo do CV:
${cv}

Resumo da vaga:
${vaga}

Perfil do entrevistador:
${perfil}

Formato da resposta:
- Pergunta 1
- Pergunta 2
  `;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );
  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return raw
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-+\s*/, '').trim())
    .slice(0, 2);
}

/**
 * Mapeia seção do JSON para tipo de pergunta (fallback caso não venha no JSON).
 */
const secaoParaTipo = {
  inicio:        'apresentacao',
  meio:          'situacional',
  encerramento:  'encerramento'
};

/**
 * Gera e salva no IndexedDB o roteiro completo da entrevista:
 *  - Perguntas de início
 *  - Perguntas do meio
 *  - Perguntas técnicas (antes do encerramento)
 *  - Perguntas de encerramento
 */
export async function gerarRoteiroEntrevista(perguntasJson) {
  const ficha = await localforage.getItem('fichaEntrevista');
  if (!ficha) throw new Error('Ficha de entrevista não encontrada.');

  // Extrai traits de forma segura
  const traits = Array.isArray(ficha.interviewer.traits)
    ? ficha.interviewer.traits
    : [];
  const perfil = ficha.interviewer.description || '';

  const roteiro = {
    inicio:       [],
    meio:         [],
    tecnicas:     [],
    encerramento: []
  };

  /**
   * Sorteia e empacota as perguntas genéricas (início, meio, encerramento).
   */
  function processarSecao(secao) {
    const perguntasDaSecao = perguntasJson[secao] || [];
    for (const perguntaObj of perguntasDaSecao) {
      const selecionada = sortearPerguntaPorTrait(perguntaObj, traits);
      if (!selecionada) continue;

      // decide o tipo: primeiro cheque no JSON, senão use o mapeamento de seção
      const tipoPergunta = perguntaObj.tipo || secaoParaTipo[secao] || 'tecnica_simples';

      const tempoRespostaSugerido = calcularTempoParaResposta(
        selecionada.pergunta,
        traits,
        tipoPergunta
      );

      roteiro[secao].push({
        id:        perguntaObj.id,
        trait:     selecionada.trait,
        pergunta:  selecionada.pergunta,
        tempoRespostaSugerido
      });
    }
  }

  // 1) perguntas de início e meio
  processarSecao('inicio');
  processarSecao('meio');

  // 2) perguntas técnicas (geradas pela IA, antes do encerramento)
  const tecnicas = await gerarPerguntasTecnicas({
    cv:    ficha.cvSummary,
    vaga:  ficha.jobDescSummary,
    perfil
  });
  roteiro.tecnicas = tecnicas.map((pergunta, idx) => ({
    id:                     `tecnica_${idx + 1}`,
    trait:                  'IA',
    pergunta,
    tempoRespostaSugerido:  calcularTempoParaResposta(pergunta, traits, 'tecnica_simples')
  }));

  // 3) perguntas de encerramento
  processarSecao('encerramento');

  // 4) salva e retorna
  await localforage.setItem('roteiroEntrevista', roteiro);
  return roteiro;
}
