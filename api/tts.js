// api/tts.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const { text } = req.query;
    
    if (!text || text.length > 200) {
      return res.status(400).json({
        error: 'Texto inválido. Máximo 200 caracteres.'
      });
    }

    const ttsUrl = new URL('https://translate.google.com/translate_tts');
    ttsUrl.searchParams.append('ie', 'UTF-8');
    ttsUrl.searchParams.append('client', 'tw-ob');
    ttsUrl.searchParams.append('tl', 'pt-BR');
    ttsUrl.searchParams.append('q', text);
    ttsUrl.searchParams.append('ttsspeed', '1');

    const response = await fetch(ttsUrl.href);

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const audioBuffer = await response.buffer();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(audioBuffer);

  } catch (error) {
    console.error('Erro na API TTS:', error);
    res.status(500).json({
      error: 'Falha ao gerar áudio',
      details: error.message
    });
  }
}
