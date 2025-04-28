// api/tts-local.cjs
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Configurações
app.use(cors());

// Rota principal
app.get('/api/tts', async (req, res) => {
  try {
    const { text } = req.query;
    
    // Validação
    if (!text || text.length > 200) {
      return res.status(400).json({
        error: 'Texto inválido. Máximo 200 caracteres.'
      });
    }

    // Construir URL do TTS
    const ttsUrl = new URL('https://translate.google.com/translate_tts');
    ttsUrl.searchParams.append('ie', 'UTF-8');
    ttsUrl.searchParams.append('client', 'tw-ob');
    ttsUrl.searchParams.append('tl', 'pt-BR');
    ttsUrl.searchParams.append('q', text);
    ttsUrl.searchParams.append('ttsspeed', '1');

    // Buscar áudio
    const response = await fetch(ttsUrl.href);
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    // Configurar resposta
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    res
      .setHeader('Content-Type', 'audio/mpeg')
      .setHeader('Cache-Control', 'public, max-age=86400')
      .send(audioBuffer);

  } catch (error) {
    console.error('Erro local:', error);
    res.status(500).json({
      error: 'Falha ao gerar áudio',
      details: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
  ====================================
   API local funcionando corretamente
  ====================================
  Frontend: http://localhost:5173
  API:      http://localhost:${PORT}/api/tts?text=Olá+Mundo
  `);
});