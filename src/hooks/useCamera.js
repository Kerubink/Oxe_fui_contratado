// src/hooks/useCamera.js
import { useEffect } from "react";

export function useCamera(videoRef, camOn, interviewStarted) {
  useEffect(() => {
    if (!interviewStarted) return;
    if (camOn) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(console.error);
    } else {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [camOn, interviewStarted]);
}
