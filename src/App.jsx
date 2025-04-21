// src/App.jsx
import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function App() {
  const [cv, setCv] = useState('');
  const [pergunta, setPergunta] = useState('');
  const [carregando, setCarregando] = useState(false);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

  const gerarPergunta = async () => {
    setCarregando(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
      const prompt = `Gere uma pergunta técnica baseada neste CV: ${cv.substring(0, 300)}`;
      
      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      
      setPergunta(text);
    } catch (error) {
      console.error('Erro:', error);
      setPergunta('Erro ao gerar pergunta');
    }
    setCarregando(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 >Simulador de Entrevista</h1>
      
      <textarea
        value={cv}
        onChange={(e) => setCv(e.target.value)}
        placeholder="Cole seu CV aqui..."
        style={{ width: '100%', height: '150px', margin: '10px 0' }}
      />
      
      <button 
        onClick={gerarPergunta}
        disabled={!cv || carregando}
        style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none' }}
      >
        {carregando ? 'Gerando...' : 'Gerar Pergunta'}
      </button>

      {pergunta && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0' }}>
          <h3>Pergunta:</h3>
          <p>{pergunta}</p>
        </div>
      )}
    </div>
  );
}

export default App;