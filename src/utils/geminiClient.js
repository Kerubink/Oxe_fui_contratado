// src/utils/geminiClient.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

// Configuração para Gemini 1.5 Flash
const FLASH_CONFIG = {
  model: 'gemini-1.5-flash-latest',  // Modelo de alta velocidade
  generationConfig: {
    maxOutputTokens: 8192,  // Aumenta capacidade
    temperature: 0.3,       // Respostas mais focadas
    topP: 0.7
  },
  systemInstruction: {
    parts: [{
      text: 'Você é um entrevistador técnico especializado. Seja conciso e direto.'
    }]
  }
};

// Função genérica otimizada
const generateFlashContent = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel(FLASH_CONFIG);
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Erro Flash:', error);
    return null;
  }
};

// Geração de perguntas com maior contexto
export const generateQuestions = async (cv, jobDesc) => {
  const context = `
    CV (resumo): ${cv.substring(0, 2000)}
    Vaga (destaques): ${jobDesc.substring(0, 1000)}
    Instruções:
    1. Gerar 5 perguntas técnicas
    2. 2 comportamentais
    3. Formato JSON
  `;

  const result = await generateFlashContent(context);
  return result ? JSON.parse(result) : [];
};

// Retruques em alta velocidade
export const generateDynamicRetort = async (contexto) => {
  const prompt = `
    Última resposta: ${contexto.resposta}
    Histórico: ${JSON.stringify(contexto.historico)}
    Gerar 1 retruque técnico em 1 frase
  `;

  return generateFlashContent(prompt);
};