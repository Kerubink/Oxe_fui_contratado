import { useEffect, useState } from 'react';

export function useQuestions() {
  const [perguntas, setPerguntas] = useState(null);

  useEffect(() => {
    fetch('/perguntas.json')
      .then((res) => res.json())
      .then(setPerguntas)
      .catch(console.error);
  }, []);

  return perguntas;
}
