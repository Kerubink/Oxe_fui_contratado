// src/utils/questionManager.js
import { generateQuestions } from './geminiClient';
import { technicalQuestions, behavioralQuestions } from '../data/questionBank';

export const generateHybridQuestions = async (cvText, jobDesc) => {
  try {
    // 1. Gera perguntas técnicas via IA
    const aiQuestions = await generateQuestions(cvText, jobDesc);
    
    // 2. Seleciona perguntas genéricas do banco local
    const genericQuestions = behavioralQuestions.slice(0, 2);
    
    // 3. Combina e randomiza
    return {
      technical: aiQuestions,
      generic: genericQuestions
    };
    
  } catch (error) {
    // Fallback para perguntas locais
    return {
      technical: technicalQuestions.frontend.slice(0, 3),
      generic: behavioralQuestions.slice(0, 2)
    };
  }
};