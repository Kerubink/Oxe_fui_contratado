// src/components/InterviewSimulator/RetortGenerator.jsx
import { generateDynamicRetort } from '../../utils/geminiClient';
import { analyzeKeywords } from '../../utils/nlpProcessor';
import localforage from 'localforage';

const RetortGenerator = {
  async generate(userAnswer, currentQuestion, session) {
    try {
      // 1. Verifica cache local primeiro
      const cachedResponse = await localforage.getItem(userAnswer);
      if (cachedResponse) return cachedResponse;

      // 2. Análise de keywords
      const keywords = analyzeKeywords(userAnswer);
      
      // 3. Tenta encontrar retruque pré-definido
      const predefined = this.checkPredefinedRetorts(
        keywords,
        currentQuestion.followUps
      );
      
      if (predefined) {
        await localforage.setItem(userAnswer, predefined);
        return predefined;
      }

      // 4. Geração dinâmica via IA se relevante
      if (this.shouldUseAI(keywords, session)) {
        const aiRetort = await generateDynamicRetort(
          userAnswer,
          currentQuestion,
          session.jobDescription
        );
        
        await localforage.setItem(userAnswer, aiRetort);
        return aiRetort;
      }

      // 5. Fallback genérico
      return this.getGenericFallback(currentQuestion.category);

    } catch (error) {
      console.error('Error generating retort:', error);
      return "Poderia elaborar mais sobre isso?";
    }
  },

  checkPredefinedRetorts(keywords, followUps) {
    for (const keyword of keywords) {
      const match = followUps.find(fu => 
        fu.triggers.some(t => t.toLowerCase() === keyword.toLowerCase())
      );
      if (match) return match.responses[0];
    }
    return null;
  },

  shouldUseAI(keywords, session) {
    const techKeywords = session.cvText.split(' ').filter(w => w.length > 5);
    return keywords.some(k => techKeywords.includes(k));
  },

  getGenericFallback(category) {
    const fallbacks = {
      technical: [
        "Como você aplicaria isso em um cenário real?",
        "Que desafios você preveria nessa abordagem?"
      ],
      behavioral: [
        "Como você mediria o sucesso dessa ação?",
        "Que feedback você recebeu nessa situação?"
      ]
    };
    return fallbacks[category][Math.floor(Math.random() * fallbacks[category].length)];
  }
};

export default RetortGenerator;