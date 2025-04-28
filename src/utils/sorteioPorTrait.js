// src/utils/sorteioPorTrait.js
export function sortearPerguntaPorTrait(perguntaObj, traits) {
  const { id, variacoes } = perguntaObj;

  // 1. Filtra variações compatíveis
  const variaçõesCompatíveis = variacoes.filter(v => 
    v.tags.some(tag => traits.includes(tag))
  );

  // 2. Fallback para universal
  const variaçõesDisponíveis = variaçõesCompatíveis.length > 0 
    ? variaçõesCompatíveis 
    : variacoes.filter(v => v.tags.includes('universal'));

  if (variaçõesDisponíveis.length === 0) return null;

  // 3. Sorteia uma variação
  const variaçãoSorteada = variaçõesDisponíveis[
    Math.floor(Math.random() * variaçõesDisponíveis.length)
  ];

  // 4. Sorteia um texto dentro da variação
  const textoSorteado = variaçãoSorteada.textos[
    Math.floor(Math.random() * variaçãoSorteada.textos.length)
  ];

  return {
    id,
    tags: variaçãoSorteada.tags,
    pergunta: textoSorteado
  };
}
