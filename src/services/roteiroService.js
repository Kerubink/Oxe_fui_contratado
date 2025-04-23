import localforage from 'localforage';
import { sortearPerguntaPorTrait } from '../utils/sorteioPorTrait';
import { calcularTempoParaResposta } from '../utils/tempoRespostaService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_A_KEY;

/**
 * Faz UMA única chamada à API Gemini para gerar 2 perguntas técnicas.
 * Retorna apenas as linhas que começam com "-".
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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return raw
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-+\s*/, '').trim())
    .slice(0, 2);
}

/**
 * Gera e salva no IndexedDB o roteiro completo da entrevista:
 *   - Perguntas de início
 *   - Perguntas do meio
 *   - Perguntas técnicas (antes do encerramento)
 *   - Perguntas de encerramento
 */
export async function gerarRoteiroEntrevista(perguntasJson) {
  const ficha = await localforage.getItem('fichaEntrevista');
  if (!ficha) throw new Error('Ficha de entrevista não encontrada.');

  // Destructuring direto da ficha normalizada
  const { traits, description: perfil } = ficha.interviewer;

  const roteiro = {
    inicio: [],
    meio: [],
    tecnicas: [],
    encerramento: []
  };

  // 1) Sorteio de perguntas genéricas de início e meio
  for (const secao of ['inicio', 'meio']) {
    for (const perguntaObj of perguntasJson[secao]) {
      const sel = sortearPerguntaPorTrait(perguntaObj, traits);
      if (sel) {
        // Calcular tempo de resposta
        const tempoResposta = calcularTempoParaResposta(sel.pergunta, traits, 'apresentacao');
        roteiro[secao].push({
          pergunta: sel.pergunta,
          tempoResposta
        });
      }
    }
  }

  // 2) Geração de perguntas técnicas via IA (antes do encerramento)
  const tecnicas = await gerarPerguntasTecnicas({
    cv: ficha.cvSummary,
    vaga: ficha.jobDescSummary,
    perfil
  });
  roteiro.tecnicas = tecnicas.map((p, i) => {
    const tempoResposta = calcularTempoParaResposta(p, traits, 'tecnica_simples');
    return {
      id: `tecnica_${i + 1}`,
      trait: 'IA',
      pergunta: p,
      tempoResposta
    };
  });

  // 3) Sorteio de perguntas de encerramento
  for (const perguntaObj of perguntasJson.encerramento) {
    const sel = sortearPerguntaPorTrait(perguntaObj, traits);
    if (sel) {
      const tempoResposta = calcularTempoParaResposta(sel.pergunta, traits, 'encerramento');
      roteiro.encerramento.push({
        pergunta: sel.pergunta,
        tempoResposta
      });
    }
  }

  // 4) Salva o roteiro completo para uso posterior
  await localforage.setItem('roteiroEntrevista', roteiro);
  return roteiro;
}
