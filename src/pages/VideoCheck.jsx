import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VideoCheck() {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setReady(true);
      })
      .catch((err) => {
        console.error('Erro ao acessar webcam:', err);
        alert('Não foi possível acessar câmera e microfone.');
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <h2 className="text-xl font-semibold">Configure sua câmera e microfone</h2>
      <video ref={videoRef} autoPlay playsInline className="w-80 rounded-lg shadow-md" />
      {ready && (
        <button
          onClick={() => navigate('/sala')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Continuar
        </button>
      )}
    </div>
  );
}
