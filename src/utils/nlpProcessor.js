// src/utils/nlpProcessor.js
import nlp from 'compromise';
import compromiseSentences from 'compromise-sentences';

// Configuração das extensões
nlp.extend(compromiseSentences);

// Adicionar palavras personalizadas
nlp.extend((Doc, world) => {
  world.addWords({
    'Positive': 'feliz eficiente sucesso excelente ótimo ganho lucro positivo bom adequado satisfatório ideal',
    'Negative': 'problema erro falha prejuízo insucesso ruim negativo dificuldade conflito atraso'
  });
});

// Função principal de análise
export const analyzeAnswer = (answer, question) => {
  const answerDoc = nlp(answer);
  const questionDoc = nlp(question.text);

  return {
    similarity: calculateSimilarity(answerDoc, questionDoc),
    keywords: extractKeywords(answerDoc),
    sentiment: analyzeSentiment(answerDoc)
  };
};

// Função de extração de keywords
export const analyzeKeywords = (text) => {
  const doc = nlp(text);
  return extractKeywords(doc);
};

// Funções auxiliares internas
const calculateSimilarity = (docA, docB) => {
  const termsA = docA.terms().out('array');
  const termsB = docB.terms().out('array');
  const intersection = termsA.filter(term => termsB.includes(term));
  return (intersection.length * 2) / (termsA.length + termsB.length) || 0;
};

const extractKeywords = (doc) => {
  return doc.nouns()
    .out('array')
    .map(term => term.toLowerCase().replace(/[^\w\s]/gi, ''))
    .filter(term => term.length > 3)
    .filter((term, index, arr) => arr.indexOf(term) === index)
    .slice(0, 5);
};

const analyzeSentiment = (doc) => {
  const positive = doc.match('#Positive').length;
  const negative = doc.match('#Negative').length;
  return positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral';
};