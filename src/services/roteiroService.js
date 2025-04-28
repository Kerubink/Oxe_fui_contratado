import localforage from 'localforage';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY;
const MODEL_NAME = 'gemini-2.0-flash-lite';

/**
 * Estima um tempo de resposta para cada pergunta
 */
function calcularTempoParaResposta(pergunta, traits, tipo) {
  const baseTempo = 60;
  const ajuste = tipo === 'tecnica' ? 30 : tipo === 'situacional' ? 20 : tipo === 'expectativa' ? 10 : 0;
  return baseTempo + ajuste;
}

/**
 * Detecta nível de dificuldade com base no título da vaga
 */
function nivelDificuldade(jobTitle) {
  const title = jobTitle.toLowerCase();
  if (title.includes('junior') || title.includes('estagi')) return 'básico';
  if (title.includes('senior') || title.includes('pleno')) return 'avançado';
  return 'intermediário';
}

export async function gerarRoteiroEntrevista() {
  // 1) Carrega a ficha do localforage
  const ficha = await localforage.getItem('fichaEntrevista');
  if (!ficha) throw new Error('Ficha de entrevista não encontrada.');

  const {
    cvSummary,
    jobDescSummary,
    jobTitle,
    company,
    interviewer
  } = ficha;

  // Puxa **tudo** do perfil do entrevistador
  const {
    name = '',
    label = '',
    disc = '',
    mbti = '',
    description = '',
    traits = []
  } = interviewer;

  const dificuldade = nivelDificuldade(jobTitle);

  // 2) Monta o prompt de forma 100% dinâmica
  const prompt = `
Você é um(a) entrevistador(a) com o seguinte perfil:
- Nome: ${name}
- Título/nível: ${label}
- DISC: ${disc}
- MBTI: ${mbti}
- Traços principais: ${traits.join(', ')}
- Descrição pessoal: ${description}

Você está conduzindo uma entrevista para a vaga de **${jobTitle}** na empresa **${company}**, nível de dificuldade **${dificuldade}**.

**Contexto do Candidato:**
${cvSummary}

**Descrição da Vaga:**
${jobDescSummary}

**Estrutura da entrevista:**
1. **2 perguntas comportamentais** (conhecer o candidato de um modo geral)
2. **2 perguntas situacionais** (situações passadas/futuras pode começar com "O que você faria se…", "nome do candidato + como você reagiria se..." )
3. **2 perguntas técnicas** (baseadas em CV + requisitos + descrição da vaga)
4. **2 perguntas de expectativa** (pretensão salarial, crescimento, visão da empresa)

**Regras de formatação:**
- Retorne **apenas** um objeto JSON, sem nenhum outro texto, assim:

\`\`\`json
{
  "questions": [
    "Pergunta comportamental 1…",
    "Pergunta comportamental 2…",
    "Pergunta situacional 1…",
    "Pergunta situacional 2…",
    "Pergunta técnica 1…",
    "Pergunta técnica 2…",
    "Pergunta de expectativa 1…",
    "Pergunta de expectativa 2…"
  ]
}
\`\`\`

- Seja claro, específico, use o tom e os traços do entrevistador.
- Nunca insira nenhum texto antes ou depois do JSON.
- Pode citar o nome da empresa e o nome do candidato se fizer sentido
`.trim();

  // 3) Chama a API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
          topP: 0.9
        },
        safetySettings: [{
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE'
        }]
      })
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Erro na API: ${err.error?.message || response.statusText}`);
  }

  // 4) Extrai o texto bruto e isola apenas o JSON
  const { candidates } = await response.json();
  const rawText = candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('Texto bruto da API:', rawText);

  const start = rawText.indexOf('{');
  const end = rawText.lastIndexOf('}');
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('Não foi possível encontrar um JSON válido na resposta.');
  }
  const jsonString = rawText.substring(start, end + 1);

  // 5) Faz o parse do JSON
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    console.error('JSON extraído:', jsonString);
    throw new Error('Falha ao parsear JSON: ' + e.message);
  }

  const perguntas = parsed.questions;
  if (!Array.isArray(perguntas) || perguntas.length !== 8) {
    throw new Error(`Esperava 8 perguntas, mas recebi ${Array.isArray(perguntas) ? perguntas.length : typeof perguntas}.`);
  }
  console.log('Perguntas extraídas:', perguntas);

  // 6) Monta o roteiro final em 4 seções
  const roteiro = {
    inicio: perguntas.slice(0, 2).map((texto, i) => ({
      id: `inicio_${i+1}`,
      tipo: 'comportamental',
      tags: ['IA', ...traits],
      pergunta: texto,
      tempoRespostaSugerido: calcularTempoParaResposta(texto, traits, 'comportamental')
    })),
    meio: perguntas.slice(2, 4).map((texto, i) => ({
      id: `meio_${i+1}`,
      tipo: 'situacional',
      tags: ['IA', ...traits],
      pergunta: texto,
      tempoRespostaSugerido: calcularTempoParaResposta(texto, traits, 'situacional')
    })),
    tecnicas: perguntas.slice(4, 6).map((texto, i) => ({
      id: `tecnicas_${i+1}`,
      tipo: 'tecnica',
      tags: ['IA', ...traits],
      pergunta: texto,
      tempoRespostaSugerido: calcularTempoParaResposta(texto, traits, 'tecnica')
    })),
    encerramento: perguntas.slice(6, 8).map((texto, i) => ({
      id: `encerramento_${i+1}`,
      tipo: 'expectativa',
      tags: ['IA', ...traits],
      pergunta: texto,
      tempoRespostaSugerido: calcularTempoParaResposta(texto, traits, 'expectativa')
    }))
  };

  // 7) Salva e retorna
  await localforage.setItem('roteiroEntrevista', roteiro);
  return roteiro;
}
