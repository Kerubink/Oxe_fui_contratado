// src/utils/faceDetection.js
import * as faceapi from 'face-api.js';

export async function initFaceApiModels() {
  // carrega o Tiny Face Detector
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
}

/**
 * Inicia um monitor de presença facial:
 * - só começa a detectar quando o <video> dispara o evento 'playing'
 * - roda detectSingleFace em requestAnimationFrame
 * - chama onAway() após 3s sem rosto
 * - chama onBack() quando o rosto reaparece
 * - retorna uma função de cleanup que cancela o loop e remove o listener
 */
export function startFaceMonitor(videoEl, onAway, onBack) {
  let lastSeen = Date.now();
  let visible = false;
  let canceled = false;

  // loop de detecção
  const detectLoop = async () => {
    if (canceled) return;
    try {
      const detection = await faceapi.detectSingleFace(
        videoEl,
        new faceapi.TinyFaceDetectorOptions()
      );
      if (detection) {
        lastSeen = Date.now();
        if (!visible) {
          visible = true;
          onBack();
        }
      } else if (Date.now() - lastSeen > 3000 && visible) {
        visible = false;
        onAway();
      }
    } catch (err) {
      console.error("Face detect error:", err);
    }
    requestAnimationFrame(detectLoop);
  };

  // quando o vídeo começar a tocar, inicia o detectLoop
  const handlePlaying = () => {
    lastSeen = Date.now();
    visible = true;
    detectLoop();
  };

  // se já estiver carregado, dispara de imediato
  if (videoEl.readyState >= 3) {
    handlePlaying();
  }
  videoEl.addEventListener("playing", handlePlaying);

  // cleanup: cancela o loop e remove o listener
  return () => {
    canceled = true;
    videoEl.removeEventListener("playing", handlePlaying);
  };
}
