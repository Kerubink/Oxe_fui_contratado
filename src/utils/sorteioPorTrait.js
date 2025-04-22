/**
 * Sorteia uma única pergunta a partir de todas as variações
 * disponíveis para os traits do entrevistador.
 *
 * @param {Object} perguntaObj  — Objeto com { id, variacoes: { trait: [perguntas] } }
 * @param {string[]} traits     — Array de traits do entrevistador
 * @returns {{id: string, trait: string, pergunta: string}|null}
 */
export function sortearPerguntaPorTrait(perguntaObj, traits) {
  const { id, variacoes } = perguntaObj;

  // 1) Acumula todas as perguntas de todos os traits válidos
  const allOptions = [];
  for (const trait of traits) {
    const lista = variacoes[trait];
    if (Array.isArray(lista)) {
      for (const pergunta of lista) {
        allOptions.push({ trait, pergunta });
      }
    }
  }

  // 2) Se não houver nenhuma opção, retorna null
  if (allOptions.length === 0) return null;

  // 3) Sorteia uniformemente entre todas as opções
  const chosen = allOptions[Math.floor(Math.random() * allOptions.length)];
  return { id, trait: chosen.trait, pergunta: chosen.pergunta };
}
