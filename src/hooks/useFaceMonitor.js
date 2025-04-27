// src/hooks/useFaceMonitor.js
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const ABSENCE_MSG = "Não consigo te ver! Por favor, posicione-se na frente da câmera.";

export function useFaceMonitor({
  videoRef,
  camOn,
  interviewStarted,
  say,
  micOn,
  transcript,
  awaitingResponse
}) {
  const absenceTimer = useRef(null);
  const modelsLoaded = useRef(false);
  const checkingRef = useRef(false);

  useEffect(() => {
    if (!interviewStarted || !camOn || !videoRef.current) return;
    let mounted = true;

    const loadModels = async () => {
      if (!modelsLoaded.current) {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        modelsLoaded.current = true;
      }
    };

    const startDetection = async () => {
      await loadModels();

      const checkFace = async () => {
        if (!mounted || !modelsLoaded.current || !videoRef.current) return;

        try {
          checkingRef.current = true;
          const detection = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          );
          checkingRef.current = false;

          if (!detection) {
            if (!absenceTimer.current) {
              absenceTimer.current = setTimeout(async () => {
                if (mounted) {
                  await say(ABSENCE_MSG);
                }
                absenceTimer.current = null;
              }, 3000); // 3 segundos sem rosto
            }
          } else {
            if (absenceTimer.current) {
              clearTimeout(absenceTimer.current);
              absenceTimer.current = null;
            }
          }
        } catch (e) {
          console.error("Erro na detecção de rosto:", e);
          checkingRef.current = false;
        }
      };

      const interval = setInterval(() => {
        if (!checkingRef.current) {
          checkFace();
        }
      }, 1000); // a cada 1 segundo

      return () => clearInterval(interval);
    };

    const stopDetection = startDetection();

    return () => {
      mounted = false;
      stopDetection.then(clear => clear && clear());
      clearTimeout(absenceTimer.current);
    };
  }, [interviewStarted, camOn, say]);

}
