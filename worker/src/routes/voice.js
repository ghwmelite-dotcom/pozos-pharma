import { authMiddleware } from '../middleware/auth.js';

export async function handleVoice(request, env, path) {
  if (path === '/api/voice/transcribe' && request.method === 'POST') {
    return transcribeAudio(request, env);
  }
  return null;
}

async function transcribeAudio(request, env) {
  const user = await authMiddleware(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const formData = await request.formData();
  const audioFile = formData.get('audio');
  if (!audioFile) return json({ error: 'Audio file required' }, 400);

  const audioBytes = await audioFile.arrayBuffer();
  const audioArray = [...new Uint8Array(audioBytes)];

  try {
    const result = await env.AI.run('@cf/openai/whisper-tiny-en', {
      audio: audioArray
    });
    return json({ text: result.text || '', vtt: result.vtt || '' });
  } catch (err) {
    console.error('Transcription error:', err);
    return json({ error: 'Transcription failed' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
