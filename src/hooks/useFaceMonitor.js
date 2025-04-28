import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const ABSENCE_MSGS = [
  "Não consigo te ver.",
  "Olá, tem certeza de que você está aí?",
  "Poxa! Acho que não está enquadrado na câmera."
];
const NO_MIC_MSGS = [
  "Acho que você esqueceu de abrir o microfone.",
  "Se não puder falar, fique à vontade para digitar no chat sua resposta.",
  "Está tudo bem? Estou no aguardo da sua resposta."
];
const SILENT_MIC_MSGS = [
  "Não consigo te ouvir...",
  "Certeza que seu microfone está funcionando?",
  "Você está falando algo? Não consigo ouvir nada..."
];

export function useFaceMonitor(
  videoRef,
  camOn,
  interviewStarted,
  playTTS,
  micOn,
  transcript,
  awaitingResponse,
  setChat,
  ttsPlaying   // ← Agora recebe ttsPlaying também
) {
  const [userVisible, setUserVisible] = useState(true);
  const absenceIdxRef = useRef(0);
  const absenceTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const lastTranscriptRef = useRef("");
  const transcriptRef = useRef(transcript);
  const micOnRef = useRef(micOn);
  const awaitingRef = useRef(awaitingResponse);
  const ttsPlayingRef = useRef(ttsPlaying);
  const runningRef = useRef(false);

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { micOnRef.current = micOn; }, [micOn]);
  useEffect(() => { awaitingRef.current = awaitingResponse; }, [awaitingResponse]);
  useEffect(() => { ttsPlayingRef.current = ttsPlaying; }, [ttsPlaying]);

  useEffect(() => {
    if (!interviewStarted || !camOn || !videoRef.current) return;
    runningRef.current = true;

    faceapi.nets.tinyFaceDetector.loadFromUri("/models").catch(() => {});

    const detectLoop = async () => {
      if (!runningRef.current) return;

      let det = null;
      try {
        det = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );
      } catch {
        det = null;
      }

      if (det) {
        setUserVisible(true);
        clearTimeout(absenceTimerRef.current);
        absenceTimerRef.current = null;

        if (awaitingRef.current && !ttsPlayingRef.current) {
          const txt = transcriptRef.current.trim();
          if (txt === lastTranscriptRef.current) {
            if (!silenceTimerRef.current) {
              silenceTimerRef.current = setTimeout(async () => {
                if (!runningRef.current) return;
                if (ttsPlayingRef.current) return; // checa antes de falar
                const msgs = micOnRef.current ? SILENT_MIC_MSGS : NO_MIC_MSGS;
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                setChat(c => [...c, { sender: "Entrevistador", text: msg }]);
                await playTTS(msg);
                silenceTimerRef.current = null;
              }, 5000);
            }
          } else {
            lastTranscriptRef.current = txt;
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else {
        setUserVisible(false);
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;

        if (!absenceTimerRef.current && !ttsPlayingRef.current) {
          absenceTimerRef.current = setTimeout(async () => {
            if (!runningRef.current) return;
            if (ttsPlayingRef.current) return;
            const next = (absenceIdxRef.current + 1) % ABSENCE_MSGS.length;
            absenceIdxRef.current = next;
            const msg = ABSENCE_MSGS[next];
            setChat(c => [...c, { sender: "Entrevistador", text: msg }]);
            await playTTS(msg);
            absenceTimerRef.current = null;
          }, 3000);
        }
      }

      requestAnimationFrame(detectLoop);
    };

    const onPlay = () => detectLoop();
    if (videoRef.current.readyState >= 3) onPlay();
    videoRef.current.addEventListener("playing", onPlay);

    return () => {
      runningRef.current = false;
      videoRef.current.removeEventListener("playing", onPlay);
      clearTimeout(absenceTimerRef.current);
      clearTimeout(silenceTimerRef.current);
      setUserVisible(true);
    };
  }, [interviewStarted, camOn]);

  return { userVisible };
}
