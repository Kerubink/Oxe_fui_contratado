// src/hooks/useFaceMonitor.js
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

// Frases de ausência (sem rosto)
const ABSENCE_MSGS = [
  "Não consigo te ver.",
  "Olá, tem certeza de que você está aí?",
  "Poxa! Acho que não está enquadrado na câmera."
];

// Frases de silêncio com mic desligado
const NO_MIC_MSGS = [
  "Acho que você esqueceu de abrir o microfone.",
  "Se não puder falar, fique à vontade para digitar no chat sua resposta.",
  "Está tudo bem? Estou no aguardo da sua resposta."
];

// Frases de silêncio com mic ligado
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
  awaitingResponse
) {
  const [userVisible, setUserVisible] = useState(true);
  const absenceIdxRef = useRef(0);
  const absenceTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const lastTranscriptRef = useRef("");

  useEffect(() => {
    if (!interviewStarted || !camOn || !videoRef.current) return;

    faceapi.nets.tinyFaceDetector.loadFromUri("/models").catch(console.error);
    let canceled = false;

    const detectLoop = async () => {
      if (canceled) return;

      try {
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        if (detection) {
          // 👤 Rosto detectado
          setUserVisible(true);

          // 🧹 Limpa timeout de ausência
          if (absenceTimerRef.current) {
            clearTimeout(absenceTimerRef.current);
            absenceTimerRef.current = null;
          }

          // 🤐 Monitoramento de silêncio
          if (awaitingResponse) {
            const trimmed = transcript.trim();

            if (trimmed === lastTranscriptRef.current) {
              // Está parado
              if (!silenceTimerRef.current) {
                console.log("[SILÊNCIO] Iniciando timer...", { micOn, transcript });
                silenceTimerRef.current = setTimeout(async () => {
                  if (!videoRef.current || canceled) return;

                  const msgs = micOn ? SILENT_MIC_MSGS : NO_MIC_MSGS;
                  const random = Math.floor(Math.random() * msgs.length);
                  console.log("[SILÊNCIO] Falando:", msgs[random]);
                  await playTTS(msgs[random]);

                  silenceTimerRef.current = null;
                }, 5000);
              }
            } else {
              // O usuário falou ou digitou
              lastTranscriptRef.current = trimmed;
              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
                console.log("[SILÊNCIO] Cancelado — houve transcrição.");
              }
            }
          } else {
            // não está aguardando resposta → limpa
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          }

        } else {
          // 🚶‍♂️ Rosto ausente
          setUserVisible(false);

          if (!absenceTimerRef.current) {
            absenceTimerRef.current = setTimeout(async () => {
              if (!videoRef.current || canceled) return;

              const next = (absenceIdxRef.current + 1) % ABSENCE_MSGS.length;
              absenceIdxRef.current = next;
              await playTTS(ABSENCE_MSGS[next]);

              absenceTimerRef.current = null;
            }, 3000);
          }

          // cancela silêncio se sumiu
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }

      } catch (err) {
        console.error("Face detect error:", err);
      }

      requestAnimationFrame(detectLoop);
    };

    const handlePlaying = () => detectLoop();
    if (videoRef.current.readyState >= 3) handlePlaying();
    videoRef.current.addEventListener("playing", handlePlaying);

    return () => {
      canceled = true;
      videoRef.current.removeEventListener("playing", handlePlaying);
      setUserVisible(true);
      if (absenceTimerRef.current) clearTimeout(absenceTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [interviewStarted, camOn, transcript, micOn, awaitingResponse]);

  return { userVisible };
}
