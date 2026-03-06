import { authMiddleware } from '../middleware/auth.js';

export async function handleVision(request, env, path) {
  if (path === '/api/vision/identify-pill' && request.method === 'POST') {
    return identifyPill(request, env);
  }
  if (path === '/api/vision/read-prescription' && request.method === 'POST') {
    return readPrescription(request, env);
  }
  return null;
}

async function identifyPill(request, env) {
  // Require auth
  const user = await authMiddleware(request, env);
  if (!user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let imageBytes;
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    if (!file || !file.size) {
      return json({ error: 'No image file provided. Please upload an image.' }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return json({ error: 'Invalid file type. Please upload an image file.' }, 400);
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return json({ error: 'Image too large. Maximum size is 10MB.' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    imageBytes = [...new Uint8Array(arrayBuffer)];
  } catch (err) {
    console.error('Failed to parse form data:', err);
    return json({ error: 'Failed to process uploaded image.' }, 400);
  }

  // Call vision model
  let aiResponse = '';
  try {
    const result = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are a pharmaceutical pill identifier. Analyze this pill image and identify: 1) Likely medication name 2) Appearance description (color, shape, markings) 3) Possible drug class 4) Important notes. If you cannot identify with confidence, say so. Always recommend consulting a pharmacist for confirmation.'
        },
        {
          role: 'user',
          content: 'Please identify this pill from the image.'
        }
      ],
      image: imageBytes
    });

    aiResponse = result.response || result.result || '';
  } catch (err) {
    console.error('AI vision model failed:', err);
    return json({ error: 'AI analysis failed. Please try again.' }, 500);
  }

  // Try to match identified drug against DB
  let matchedDrugs = [];
  try {
    // Extract potential drug names from AI response (words that could be drug names)
    const words = aiResponse.split(/[\s,.:;()\[\]]+/).filter(w => w.length >= 4);
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];

    for (const word of uniqueWords.slice(0, 10)) {
      const searchTerm = `%${word}%`;
      const results = await env.DB.prepare(
        `SELECT id, generic_name, brand_names, drug_class, uses
         FROM drugs
         WHERE generic_name LIKE ? OR brand_names LIKE ?
         LIMIT 3`
      ).bind(searchTerm, searchTerm).all();

      if (results.results && results.results.length > 0) {
        for (const drug of results.results) {
          if (!matchedDrugs.find(d => d.id === drug.id)) {
            matchedDrugs.push(drug);
          }
        }
      }
    }

    // Limit matched drugs
    matchedDrugs = matchedDrugs.slice(0, 5);
  } catch (err) {
    console.error('Drug matching failed:', err);
    // Non-fatal — still return AI response
  }

  return json({ identification: aiResponse, matchedDrugs });
}

async function readPrescription(request, env) {
  // Require auth
  const user = await authMiddleware(request, env);
  if (!user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let imageBytes;
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    if (!file || !file.size) {
      return json({ error: 'No image file provided. Please upload an image.' }, 400);
    }

    if (!file.type.startsWith('image/')) {
      return json({ error: 'Invalid file type. Please upload an image file.' }, 400);
    }

    if (file.size > 10 * 1024 * 1024) {
      return json({ error: 'Image too large. Maximum size is 10MB.' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    imageBytes = [...new Uint8Array(arrayBuffer)];
  } catch (err) {
    console.error('Failed to parse form data:', err);
    return json({ error: 'Failed to process uploaded image.' }, 400);
  }

  // Call vision model
  let aiResponse = '';
  try {
    const result = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are a prescription reader. Extract all medication names, dosages, frequencies, and instructions from this prescription image. List each medication on a separate line.'
        },
        {
          role: 'user',
          content: 'Please read and extract all medications from this prescription image.'
        }
      ],
      image: imageBytes
    });

    aiResponse = result.response || result.result || '';
  } catch (err) {
    console.error('AI vision model failed:', err);
    return json({ error: 'AI analysis failed. Please try again.' }, 500);
  }

  // Cross-reference extracted drug names with DB
  let matchedDrugs = [];
  try {
    const words = aiResponse.split(/[\s,.:;()\[\]]+/).filter(w => w.length >= 4);
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];

    for (const word of uniqueWords.slice(0, 15)) {
      const searchTerm = `%${word}%`;
      const results = await env.DB.prepare(
        `SELECT id, generic_name, brand_names, drug_class, uses
         FROM drugs
         WHERE generic_name LIKE ? OR brand_names LIKE ?
         LIMIT 3`
      ).bind(searchTerm, searchTerm).all();

      if (results.results && results.results.length > 0) {
        for (const drug of results.results) {
          if (!matchedDrugs.find(d => d.id === drug.id)) {
            matchedDrugs.push(drug);
          }
        }
      }
    }

    matchedDrugs = matchedDrugs.slice(0, 10);
  } catch (err) {
    console.error('Drug matching failed:', err);
  }

  return json({ extracted: aiResponse, matchedDrugs });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
