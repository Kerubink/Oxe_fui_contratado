// Versão Serverless (Vercel)
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const { text } = req.query;
    
    // Validação básica
    if (!text || text.length > 200) {
      return res.status(400).json({
        error: 'Texto inválido. Máximo 200 caracteres.'
      });
    }

    // Construir URL do Google TTS
    const ttsUrl = new URL('https://translate.google.com/translate_tts');
    ttsUrl.searchParams.append('ie', 'UTF-8');
    ttsUrl.searchParams.append('client', 'tw-ob');
    ttsUrl.searchParams.append('tl', 'pt-BR');
    ttsUrl.searchParams.append('q', text);
    ttsUrl.searchParams.append('ttsspeed', '1');

    // Buscar áudio do Google
    const response = await fetch(ttsUrl.href);
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    // Configurar resposta
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    const audioBuffer = await response.buffer();
    res.send(audioBuffer);

  } catch (error) {
    console.error('Erro na API:', error);
    res.status(500).json({
      error: 'Falha ao gerar áudio',
      details: error.message
    });
  }
};