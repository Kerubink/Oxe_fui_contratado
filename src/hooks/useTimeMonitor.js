// src/hooks/useTimeMonitor.js
import { useEffect, useRef } from "react";

const TIME_THRESHOLDS = [0.5, 0.8, 1.0];
const CONNECTION_PHRASES = [
  "Hmmmm, deixa eu ver aqui...",
  "Ok, agora eu quero saber...",
  "Como próxima pergunta, quero que você me diga..."
];

const TRAIT_GROUPS = {
  DOMINANCIA: {
    traits: ['decisivo', 'assertivo', 'orientado a resultados', 'direto'],
    messages: {
      reminders: [
        "Mantenha a resposta objetiva",
        "Conclua sua resposta nos próximos instantes"
      ],
      final: "Resposta registrada. Próxima etapa"
    }
  },
  INFLUENCIA: {
    traits: ['persuasivo', 'comunicativo', 'entusiasta', 'energetico'],
    messages: {
      reminders: [
        "Como você convenceria alguém dessa ideia?",
        "Explore mais as implicações emocionais"
      ],
      final: "Boa argumentação. Vamos seguir"
    }
  },
  ESTABILIDADE: {
    traits: ['paciente', 'analitico', 'detalhista', 'metodico'],
    messages: {
      reminders: [
        "Quer adicionar mais detalhes técnicos?",
        "Detalhe os critérios de validação"
      ],
      final: "Análise suficiente. Continuamos"
    }
  },
  RELACIONAL: {
    traits: ['empatico', 'colaborativo', 'diplomatico', 'observador'],
    messages: {
      reminders: [
        "Como isso impactaria o trabalho em equipe?",
        "Vamos avançar quando estiver pronto"
      ],
      final: "Agradeço sua perspectiva. Próximo tópico"
    }
  }
};

const DEFAULT_MESSAGES = {
  reminders: [
    "Sinta-se à vontade para elaborar",
    "Vamos para a próxima pergunta em breve"
  ],
  final: "Obrigado. Continuando nossa entrevista..."
};

const getDominantTraitGroup = (traits) => {
  const groupMatches = Object.entries(TRAIT_GROUPS).map(([groupName, group]) => ({
    group: groupName,
    count: traits.filter(t => group.traits.includes(t)).length
  }));

  const dominantGroup = groupMatches.reduce((prev, current) => 
    (current.count > prev.count) ? current : prev, { count: 0 });

  return dominantGroup.count >= 2 
    ? TRAIT_GROUPS[dominantGroup.group].messages
    : DEFAULT_MESSAGES;
};

export function useTimeMonitor({
  currentQuestion,
  awaitingResponse,
  playTTS,
  sendSystemMessage,
  forceNextQuestion,
  sendResponse
}) {
  const timers = useRef([]);

  const getRandomConnectionPhrase = () => 
    CONNECTION_PHRASES[Math.floor(Math.random() * CONNECTION_PHRASES.length)];

  useEffect(() => {
    if (!awaitingResponse || !currentQuestion?.tags) return;

    const messages = getDominantTraitGroup(currentQuestion.tags);
    const timeLimit = currentQuestion.tempoRespostaSugerido * 1000;

    TIME_THRESHOLDS.forEach((threshold, index) => {
      const timer = setTimeout(async () => {
        if (index < TIME_THRESHOLDS.length - 1) {
          sendSystemMessage(messages.reminders[index]);
        } else {
          await sendResponse(true);
          playTTS(messages.final);
          
          setTimeout(async () => {
            const phrase = getRandomConnectionPhrase();
            await playTTS(phrase);
            forceNextQuestion();
          }, 3000);
        }
      }, timeLimit * threshold);

      timers.current.push(timer);
    });

    return () => timers.current.forEach(t => clearTimeout(t));
  }, [awaitingResponse, currentQuestion]);
}