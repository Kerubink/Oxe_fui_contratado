// src/services/roteiroService.js
import localforage from 'localforage';
import { sortearPerguntaPorTrait } from '../utils/sorteioPorTrait';
import { calcularTempoParaResposta } from '../utils/tempoRespostaService';
import { traitMappings, convertTraits } from '../data/traits';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_A_KEY;

const secaoParaTipo = {
  inicio: 'comportamental',
  meio: 'situacional',
  encerramento: 'fechamento'
};

async function gerarPerguntasTecnicas({ cv, vaga, perfil, traits }) {
  const prompt = `
Você é um entrevistador profissional. Gere exatamente 2 perguntas técnicas usando ESTES ELEMENTOS:

**Perfil do Candidato:**
${cv}

**Requisitos da Vaga:**
${vaga}

**Estilo do Entrevistador:**
- Traits: ${traits.join(', ')}
- Descrição: ${perfil}

**Instruções:**
1. Combine hard skills e aspectos comportamentais
2. Use termos técnicos específicos
3. Formato rigoroso:
   - Pergunta 1
   - Pergunta 2
  `.trim();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ 
          parts: [{ text: prompt }] 
        }] 
      })
    }
  );
  
  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return rawText
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^[-\d\.\s]+/, '').trim())
    .slice(0, 2);
}

export async function gerarRoteiroEntrevista(perguntasJson) {
  const ficha = await localforage.getItem('fichaEntrevista');
  if (!ficha) throw new Error('Ficha de entrevista não encontrada.');

  const traitsAntigos = ficha.interviewer.traits || [];
  const traitsNovos = convertTraits(traitsAntigos);
  const perfil = ficha.interviewer.description || '';

  const roteiro = {
    inicio: [],
    meio: [],
    tecnicas: [],
    encerramento: []
  };

  const processarSecao = (secao) => {
    perguntasJson[secao]?.forEach(perguntaObj => {
      const resultado = sortearPerguntaPorTrait(perguntaObj, traitsNovos);
      if (!resultado) return;

      roteiro[secao].push({
        id: perguntaObj.id,
        tipo: perguntaObj.tipo || secaoParaTipo[secao],
        tags: [...resultado.tags, ...traitsAntigos],
        pergunta: resultado.pergunta,
        tempoRespostaSugerido: calcularTempoParaResposta(
          resultado.pergunta,
          traitsAntigos,
          perguntaObj.tipo || secaoParaTipo[secao]
        )
      });
    });
  };

  ['inicio', 'meio', 'encerramento'].forEach(processarSecao);

  const tecnicas = await gerarPerguntasTecnicas({
    cv: ficha.cvSummary,
    vaga: ficha.jobDescSummary,
    perfil,
    traits: traitsAntigos
  });

  roteiro.tecnicas = tecnicas.map((pergunta, idx) => ({
    id: `tecnica_${idx + 1}`,
    tipo: 'tecnica',
    tags: ['IA', ...traitsAntigos],
    pergunta,
    tempoRespostaSugerido: calcularTempoParaResposta(
      pergunta,
      traitsAntigos,
      'tecnica'
    )
  }));

  await localforage.setItem('roteiroEntrevista', roteiro);
  return roteiro;
}