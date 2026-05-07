const express = require('express');
const router = express.Router();
const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const hasAzureConfig = Boolean(AZURE_SPEECH_KEY && AZURE_SPEECH_REGION);
const hasOpenAIConfig = Boolean(OPENAI_API_KEY);

if (hasAzureConfig) {
  console.log('Azure Speech TTS is configured');
} else {
  console.log('Azure Speech TTS not configured. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.');
}

if (hasOpenAIConfig) {
  console.log('OpenAI TTS fallback is configured');
} else {
  console.log('OpenAI TTS fallback not configured. Set OPENAI_API_KEY.');
}

const getVoiceConfig = (language) => {
  const normalizedLanguage = String(language || '').toLowerCase();
  if (normalizedLanguage.startsWith('ne')) {
    return {
      azureLanguage: 'ne-NP',
      azureVoice: 'ne-NP-HemkalaNeural',
      openAiVoice: 'alloy',
    };
  }

  return {
    azureLanguage: 'en-US',
    azureVoice: 'en-US-JennyNeural',
    openAiVoice: 'alloy',
  };
};

const escapeXml = (text) =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const synthesizeWithAzure = async (text, language) => {
  const voiceConfig = getVoiceConfig(language);
  const ssml = `<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.0" xml:lang="${voiceConfig.azureLanguage}">
  <voice name="${voiceConfig.azureVoice}">${escapeXml(text)}</voice>
</speak>`;

  const endpoint = `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
      'User-Agent': 'Herboscope-TTS',
    },
    body: ssml,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure TTS failed (${response.status}): ${errorText}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return audioBuffer.toString('base64');
};

const synthesizeWithOpenAI = async (text, language) => {
  const voiceConfig = getVoiceConfig(language);
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice: voiceConfig.openAiVoice,
      input: text,
      format: 'mp3',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI TTS failed (${response.status}): ${errorText}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return audioBuffer.toString('base64');
};

const synthesizeWithStreamElements = async (text, language) => {
  // Free fallback with no API key. For Nepali text, Aditi (hi-IN) usually reads Devanagari reasonably.
  const normalizedLanguage = String(language || '').toLowerCase();
  const voice = normalizedLanguage.startsWith('ne') ? 'Aditi' : 'Brian';
  const trimmedText = String(text || '').trim().slice(0, 800);

  if (!trimmedText) {
    throw new Error('No text provided for StreamElements TTS');
  }

  const endpoint = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(trimmedText)}`;
  const response = await fetch(endpoint, { method: 'GET' });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`StreamElements TTS failed (${response.status}): ${errorText}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return audioBuffer.toString('base64');
};

router.post('/tts', async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text || !language) {
      return res.status(400).json({ error: 'Text and language are required' });
    }

    console.log('TTS request:', { text: text.substring(0, 50), language });

    if (hasAzureConfig) {
      try {
        const audio = await synthesizeWithAzure(text, language);
        return res.json({
          success: true,
          audio,
          format: 'mp3',
          provider: 'azure',
        });
      } catch (error) {
        console.error('Azure TTS error:', error.message);
      }
    }

    if (hasOpenAIConfig) {
      try {
        const audio = await synthesizeWithOpenAI(text, language);
        return res.json({
          success: true,
          audio,
          format: 'mp3',
          provider: 'openai',
        });
      } catch (error) {
        console.error('OpenAI TTS error:', error.message);
      }
    }

    // Keyless fallback so TTS still works without provider credentials
    try {
      const audio = await synthesizeWithStreamElements(text, language);
      return res.json({
        success: true,
        audio,
        format: 'mp3',
        provider: 'streamelements',
      });
    } catch (error) {
      console.error('StreamElements TTS error:', error.message);
    }

    return res.status(500).json({
      error: 'No TTS provider configured',
      details: 'All providers failed. Configure AZURE_SPEECH_KEY + AZURE_SPEECH_REGION or OPENAI_API_KEY, or check internet access for fallback provider.',
    });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Text-to-speech failed', details: error.message });
  }
});

module.exports = router;
