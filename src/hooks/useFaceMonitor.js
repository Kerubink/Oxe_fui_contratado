// src/hooks/useFaceMonitor.js
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const ABSENCE_MSGS = [
  "Não consigo te ver.",
  "Olá, tem certeza de que você está aí?",
  "Poxa! Acho que não está enquadrado na câmera."
];

export function useFaceMonitor(videoRef, camOn, interviewStarted, playTTS) {
  const [userVisible, setUserVisible] = useState(true);
  const absenceIdxRef = useRef(0);
  const absenceTimerRef = useRef(null);

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
          setUserVisible(true);
          if (absenceTimerRef.current) {
            clearTimeout(absenceTimerRef.current);
            absenceTimerRef.current = null;
          }
        } else {
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
      if (absenceTimerRef.current) {
        clearTimeout(absenceTimerRef.current);
        absenceTimerRef.current = null;
      }
    };
  }, [interviewStarted, camOn]);

  return { userVisible };
}
