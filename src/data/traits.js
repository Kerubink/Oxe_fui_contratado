// src/data/traits.js
export const traitMappings = {
  'empatico': ['estabilidade', 'sentimento'],
  'paciente': ['estabilidade'],
  'observador': ['conformidade', 'sensacao'],
  'encorajador': ['influencia', 'sentimento'],
  'analitico': ['conformidade', 'pensamento'],
  'visionario': ['intuicao', 'dominancia'],
  'decisivo': ['dominancia', 'julgamento'],
  'exigente': ['conformidade', 'julgamento'],
  'energetico': ['influencia', 'extroversao'],
  'persuasivo': ['influencia'],
  'adaptavel': ['percepcao'],
  'curioso': ['intuicao', 'percepcao'],
  'metodico': ['conformidade', 'julgamento'],
  'preciso': ['conformidade'],
  'detalhista': ['conformidade', 'sensacao'],
  'diplomatica': ['sentimento', 'julgamento'],
  'colaborativa': ['estabilidade', 'sentimento'],
  'pratico': ['sensacao', 'julgamento'],
  'direto': ['dominancia'],
  'orientado a resultados': ['dominancia', 'julgamento'],
  'IA': ['IA'],
  'colaboracao': ['cooperativo', 'empatia'],
  'planejamento': ['metodico', 'estrategico']
};

export function convertTraits(oldTraits) {
  return [...new Set(oldTraits.flatMap(t => 
    traitMappings[t] ? [...traitMappings[t], t] : [t]
  ))];
}