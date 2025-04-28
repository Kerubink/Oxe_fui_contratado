// src/utils/summarizer.js

import { removeStopwords } from 'stopword';
import stopwordsPt from 'stopwords-pt';

/**
 * Resumidor extractivo simples por frequência de termos.
 * @param {string} text - texto completo.
 * @param {number} nSentences - número de sentenças no resumo.
 * @returns {string} resumo com as top nSentences frases, na ordem original.
 */
export function summarizeText(text, nSentences = 5) {
  // 1) Quebra em sentenças
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];

  // 2) Limpa e tokeniza todo o texto em palavras
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9à-úçäëîïöü\s]/g, ' ')
    .split(/\s+/);

  // 3) Remove stopwords em pt‑BR
  const keywords = removeStopwords(words, stopwordsPt);

  // 4) Mapa de frequência de cada palavra-chave
  const freqMap = keywords.reduce((acc, w) => {
    acc[w] = (acc[w] || 0) + 1;
    return acc;
  }, {});

  // 5) Score de cada sentença = soma das frequências das palavras que ela contém
  const sentenceScores = sentences.map((sentence) => {
    const senWords = sentence
      .toLowerCase()
      .replace(/[^a-z0-9à-úçäëîïöü\s]/g, ' ')
      .split(/\s+/);
    const score = senWords.reduce((sum, w) => sum + (freqMap[w] || 0), 0);
    return { sentence: sentence.trim(), score };
  });

  // 6) Pega as top nSentences por score
  const top = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, nSentences);

  // 7) Ordena de volta pela posição original
  const ordered = top.sort(
    (a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence)
  );

  return ordered.map((item) => item.sentence).join(' ');
}
