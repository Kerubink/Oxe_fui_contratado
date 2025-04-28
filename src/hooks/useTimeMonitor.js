import { useEffect, useRef } from "react";

export function useTimeMonitor({
  currentQuestion,
  awaitingResponse,
  playTTS,
  sendSystemMessage,
  forceNextQuestion,
  sendResponse
}) {
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach(t => clearTimeout(t));
    timers.current = [];

    if (!awaitingResponse || !currentQuestion?.tags) return;

    const total = (currentQuestion.tempoRespostaSugerido || 60) * 1000;

    const timer = setTimeout(async () => {
      await sendResponse(true);
      sendSystemMessage("Vamos seguir para a próxima pergunta!");
      await playTTS("Vamos seguir para a próxima pergunta!");
      forceNextQuestion();
    }, total);

    timers.current.push(timer);

    return () => {
      timers.current.forEach(t => clearTimeout(t));
    };
  }, [
    awaitingResponse,
    currentQuestion,
    playTTS,
    sendSystemMessage,
    forceNextQuestion,
    sendResponse
  ]);
}
