export const technicalQuestions = {
    frontend: [
      {
        question: "Como você otimizaria o desempenho de uma aplicação React?",
        followUps: {
          rerender: "Que técnicas usaria para minimizar rerenders desnecessários?",
          bundle: "Como reduziria o tamanho do bundle JavaScript?",
          caching: "Que estratégias de caching implementaria?"
        }
      }
    ],
    backend: [
      {
        question: "Explique como implementaria autenticação JWT",
        followUps: {
          security: "Como protegeria contra ataques CSRF?",
          refresh: "Qual seria sua estratégia para refresh tokens?"
        }
      }
    ]
  };
  
  export const behavioralQuestions = [
    {
      question: "Conte sobre um conflito em equipe e como resolveu",
      followUps: {
        communication: "Que técnicas de comunicação você usou?",
        result: "Qual foi o resultado final dessa situação?"
      }
    }
  ];