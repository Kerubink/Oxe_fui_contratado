// src/services/avaliacaoService.js

import localforage from 'localforage'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY
const MODEL_NAME     = 'gemini-2.0-flash-lite'


function makeCacheKey(ficha, rawRoteiro) {
  const payload = JSON.stringify({ ficha, rawRoteiro })
  return 'avaliacao_' + encodeURIComponent(payload)
}

export async function avaliarCandidatoComGemini() {
  // 1) Carrega ficha e roteiro
  const ficha      = await localforage.getItem('fichaEntrevista')
  const rawRoteiro = await localforage.getItem('roteiroEntrevista')

  if (!ficha) {
    throw new Error('Ficha de entrevista não encontrada.')
  }

  // 2) Monta chave de cache
  const cacheKey = makeCacheKey(ficha, rawRoteiro)
  const cached   = await localforage.getItem(cacheKey)
  if (cached) {
    // console.log('Usando avaliação em cache para', cacheKey)
    return cached
  }

  // 3) Extrai dados da ficha
  const {
    interviewer    = {},
    jobDescSummary = '',
    cvSummary      = '',
    jobTitle       = ''
  } = ficha
  const traits = interviewer.traits || []

  // 4) “Achata” o roteiro (concatena início, meio, técnicas e encerramento)
  let perguntas = []
  if (
    rawRoteiro &&
    ['inicio','meio','tecnicas','encerramento']
      .every(sec => Array.isArray(rawRoteiro[sec]))
  ) {
    perguntas = [
      ...rawRoteiro.inicio,
      ...rawRoteiro.meio,
      ...rawRoteiro.tecnicas,
      ...rawRoteiro.encerramento
    ]
  }

  // 5) Se não houver respostas, retorno de fallback (e também cacheamos)
  if (perguntas.length === 0) {
    const vazio = {
      scoreGeral: 0,
      scoreTecnico: 0,
      scoreAfinidade: 0,
      feedbackComportamental: [],
      feedbackSituacional: [],
      feedbackTecnico: [],
      feedbackExpectativa: [],
      recommendations: [
        'Responda às perguntas simuladas para receber feedback personalizado.'
      ],
      explanationTecnico: '',
      explanationAfinidade: '',
      explanationGeral: ''
    }
    await localforage.setItem(cacheKey, vazio)
    return vazio
  }

  // 6) Monta o bloco Q&A
  const allQAs = perguntas
    .map(q => `Q: ${q.pergunta}\nA: ${q.resposta || '[Sem resposta]'}`)
    .join('\n\n')

  // 7) Prompt detalhado
  const prompt = `
Você é um coach de entrevistas para desenvolvedores que ajuda candidatos a praticar e evoluir.

Entrevistador simulado: ${interviewer.name || '—'} (DISC: ${interviewer.disc || '—'}, MBTI: ${interviewer.mbti || '—'}, descrição do entrevistador: ${interviewer.description || '—'}, estilo: ${interviewer.label || '—'}; traços de personalidade: ${traits.join(', ')})
Vaga: ${jobTitle}

Contexto da vaga:
${jobDescSummary}

Resumo do CV:
${cvSummary}

Respostas do candidato:
${allQAs}

Sua tarefa:
1. Dê notas de 0 a 10 para:
   - Técnica: clareza e domínio do conteúdo técnico.
   - Afinidade: alinhamento das respostas com o perfil do entrevistador (efeito auréola).
   - Geral: média das duas anteriores.
2. Para cada categoria (comportamental, situacional, técnica, expectativa), escreva 2–3 dicas construtivas.
3. Forneça 3–5 recomendações práticas de estudo e prática para o candidato.
4. Explique em 1–2 parágrafos o porquê de cada nota (fields: explanationTecnico, explanationAfinidade, explanationGeral).
5. **Não** use “recomendo a contratação”. Foco no aprendizado do candidato.

Retorne **apenas** um JSON válido neste formato:

\`\`\`json
{
  "scoreGeral": number,
  "scoreTecnico": number,
  "scoreAfinidade": number,
  "feedbackComportamental": [string],
  "feedbackSituacional": [string],
  "feedbackTecnico": [string],
  "feedbackExpectativa": [string],
  "recommendations": [string],
  "explanationTecnico": string,
  "explanationAfinidade": string,
  "explanationGeral": string
}
\`\`\`
`.trim()

  // 8) Chama a API Gemini (generateContent)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:    0.7,
          maxOutputTokens: 1500,
          topP:           0.9
        },
        safetySettings: [{
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE'
        }]
      })
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Erro na API: ${err.error?.message || response.statusText}`)
  }

  // 9) Extrai e parseia o JSON da resposta
  const { candidates } = await response.json()
  const rawText = candidates?.[0]?.content?.parts?.[0]?.text || ''
  const start = rawText.indexOf('{')
  const end   = rawText.lastIndexOf('}')
  if (start < 0 || end <= start) {
    console.error('Resposta bruta da IA:', rawText)
    throw new Error('Não foi possível encontrar um JSON válido na resposta.')
  }
  const parsed = JSON.parse(rawText.slice(start, end + 1))

  // 10) Armazena no cache e retorna
  await localforage.setItem(cacheKey, parsed)
  return parsed
}
