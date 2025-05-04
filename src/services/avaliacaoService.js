import localforage from 'localforage'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY
const MODEL_NAME     = 'gemini-2.0-flash-lite'

export async function avaliarCandidatoComGemini() {
  // 1) Puxa do IndexedDB
  const respostas      = (await localforage.getItem('respostasEntrevista')) || []
  const entrevistador  = (await localforage.getItem('traitsEntrevistador')) || {}
  const jobDescSummary = (await localforage.getItem('jobDescSummary')) || ''
  const cvSummary      = (await localforage.getItem('cvSummary')) || ''

  // 2) Se não respondeu nada, retorna JSON de fallback
  if (respostas.length === 0) {
    return {
      scoreGeral: 0,
      scoreTecnico: 0,
      scoreAfinidade: 0,
      feedbacks: {
        tecnico:        'Nenhuma resposta fornecida. Não foi possível avaliar técnica.',
        afinidade:      'Nenhuma resposta fornecida. Não foi possível avaliar afinidade.',
        comportamental: 'Nenhuma resposta fornecida.',
        situacional:    'Nenhuma resposta fornecida.',
        expectativa:    'Nenhuma resposta fornecida.'
      },
      recommendations: [
        'Por favor, responda às perguntas para obter feedback personalizado.'
      ]
    }
  }

  // 3) Monte o Q&A formatado
  const allQAs = respostas
    .map(q => `Q: ${q.pergunta}\nA: ${q.resposta}`)
    .join('\n\n')

  // 4) Seu prompt original + bloco de regras adicionais
  const prompt = `
**Instruções do Sistema**
Você é um avaliador técnico sênior que considera o **efeito auréola**:
O entrevistador é ${entrevistador.name}, perfil DISC (${entrevistador.disc}), MBTI (${entrevistador.mbti}), estilo "${entrevistador.label}", traços: ${ (entrevistador.traits||[]).join(', ') }.

**Contexto da vaga:** ${jobDescSummary}
**Resumo do CV:** ${cvSummary}

**Q&A da entrevista**
${allQAs}

---

**Regras adicionais (adicionadas):**

1. Se o candidato **não respondeu nenhuma pergunta**, retorne **apenas** este JSON:
\`\`\`json
{
  "scoreGeral": 0,
  "scoreTecnico": 0,
  "scoreAfinidade": 0,
  "feedbacks": {
    "tecnico": "Nenhuma resposta fornecida. Não foi possível avaliar técnica.",
    "afinidade": "Nenhuma resposta fornecida. Não foi possível avaliar afinidade.",
    "comportamental": "Nenhuma resposta fornecida.",
    "situacional": "Nenhuma resposta fornecida.",
    "expectativa": "Nenhuma resposta fornecida."
  },
  "recommendations": [
    "Por favor, responda às perguntas para obter feedback personalizado."
  ]
}
\`\`\`

2. Caso haja **respostas**, siga seu fluxo normal **mais** estas instruções:

### Pontuação
- Calcule 3 notas de 0 a 10:
  - **scoreTecnico**: clareza e exatidão técnica.
  - **scoreAfinidade**: alinhamento com os traços do entrevistador (efeito auréola).
  - **scoreGeral**: média aritmética de scoreTecnico e scoreAfinidade.

### Formato de saída
- **Retorne apenas** um JSON **válido** e **exato** neste formato:

\`\`\`json
{
  "scoreGeral": number,
  "scoreTecnico": number,
  "scoreAfinidade": number,
  "feedbacks": {
    "tecnico": string,
    "afinidade": string,
    "comportamental": string,
    "situacional": string,
    "expectativa": string
  },
  "recommendations": [ string ]
}
\`\`\`

---

**Formato de saída original (use estes títulos no texto, mas parse para JSON)**

### Feedback Comportamental  
- 3 bullet points  
### Feedback Situacional  
- 3 bullet points  
### Feedback Técnico  
- 3 bullet points  
### Feedback de Expectativa  
- 2 bullet points  
### Recomendações  
- 3 ações específicas
`.trim()

  // 5) Chamada à API Gemini
  const response = await fetch(
    `https://api.generativelanguage.googleapis.com/v1beta2/models/${MODEL_NAME}:generateMessage?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        temperature:    0.2,
        candidateCount: 1,
        prompt: {
          messages: [
            { role: 'system', content: 'Você é um avaliador preciso e imparcial.' },
            { role: 'user',   content: prompt }
          ]
        }
      })
    }
  )
  if (!response.ok) {
    const err = await response.json()
    throw new Error(`API Error: ${err.error?.message || response.statusText}`)
  }

  // 6) Parse e retorne o JSON
  const { candidates } = await response.json()
  let parsed
  try {
    parsed = JSON.parse(candidates[0].message.content)
  } catch {
    throw new Error('Não foi possível interpretar o JSON de avaliação.')
  }
  return parsed
}
