// serviços/avaliacaoService.js
import localforage from 'localforage';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY;
const MODEL_NAME = 'gemini-2.0-flash-lite';

/**
 * Faz o parsing do texto bruto de avaliação retornado pela IA,
 * esperando seções marcadas com "### <Título>"
 */
function parseEvaluationResponse(rawText) {
  const sections = rawText
    .split(/###\s*(?=[A-Za-z])/g)
    .map(s => s.trim())
    .filter(Boolean);

  const result = {
    score: 0,
    feedbackComportamental: [],
    feedbackSituacional: [],
    feedbackTecnico: [],
    feedbackExpectativa: [],
    recommendations: []
  };

  sections.forEach(section => {
    const [headerLine, ...bodyLines] = section.split('\n');
    const title = headerLine.trim().toLowerCase();
    const bullets = bodyLines
      .map(l => l.replace(/^-+\s*/, '').trim())
      .filter(Boolean);

    if (title.includes('pontuação')) {
      result.score = parseInt(bullets[0]?.match(/\d+/)?.[0] || '0', 10);
    } else if (title.includes('comportament')) {
      result.feedbackComportamental = bullets;
    } else if (title.includes('situacion')) {
      result.feedbackSituacional = bullets;
    } else if (title.includes('técnic') || title.includes('tecnica')) {
      result.feedbackTecnico = bullets;
    } else if (title.includes('expectativ')) {
      result.feedbackExpectativa = bullets;
    } else if (title.includes('recomenda')) {
      result.recommendations = bullets;
    }
  });

  return result;
}

export async function avaliarCandidatoComGemini() {
  // 1) carrega ficha e roteiro
  const [ficha, roteiro] = await Promise.all([
    localforage.getItem('fichaEntrevista'),
    localforage.getItem('roteiroEntrevista')
  ]);
  if (!ficha) throw new Error('Ficha de entrevista não encontrada.');
  if (!roteiro) throw new Error('Roteiro de entrevista não encontrado.');

  const {
    cvSummary,
    jobDescSummary,
    interviewer: { name, label, disc, mbti, description, traits = [] }
  } = ficha;

  // 2) formata todas as Q&A
  function formatQA(secao, arr) {
    return arr
      .map((p, i) => `Pergunta ${i+1} (${secao}): ${p.pergunta}\nResposta: ${p.resposta || '[sem resposta]'}`)
      .join('\n\n');
  }

  const allQAs = [
    formatQA('comportamental', roteiro.inicio),
    formatQA('situacional',    roteiro.meio),
    formatQA('técnica',        roteiro.tecnicas),
    formatQA('expectativa',    roteiro.encerramento)
  ].join('\n\n');

  // 3) monta prompt de avaliação
  const prompt = `
**Instruções do Sistema**
Você é um avaliador técnico sênior que considera o **efeito auréola**:
O entrevistador é ${name}, perfil DISC (${disc}), MBTI (${mbti}), estilo "${label}", traços: ${traits.join(', ')}. Ele valoriza empatia, feedback construtivo e crescimento gradual.

**Contexto da vaga:** ${jobDescSummary}
**Resumo do CV:** ${cvSummary}

**Q&A da entrevista**  
${allQAs}

**Formato de saída (use estes títulos)**

### Pontuação
nota de 0 a 10

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
`.trim();

  // 4) chamada única à API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1500, topP: 0.95 },
        safetySettings: [{ category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }]
      })
    }
  );
  if (!response.ok) {
    const e = await response.json();
    throw new Error(`API Error: ${e.error?.message || response.statusText}`);
  }

  // 5) parse e retorno
  const { candidates } = await response.json();
  const rawText = candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('Avaliação bruta:', rawText);
  return parseEvaluationResponse(rawText);
}
