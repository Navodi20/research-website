module.exports = async function (context, req) {
  try {
    const request = req || context?.req || context?.request
    const body = request?.body ?? (request?.json ? await request.json() : undefined)
    const text = body?.text

    if (!text || typeof text !== 'string' || !text.trim()) {
      return {
        status: 400,
        body: { error: 'Missing or invalid text payload.' },
      }
    }

    const hfKey =
      process.env.HUGGINGFACE_API_KEY ||
      process.env.VITE_HF_API_KEY ||
      process.env.VITE_HUGGINGFACE_API_KEY ||
      process.env.HF_API_KEY ||
      process.env.VITE_HF_KEY ||
      process.env.VITE_HUGGING_FACE_API_KEY

    if (!hfKey) {
      return {
        status: 500,
        body: { error: 'Hugging Face API key not configured in function runtime.' },
      }
    }

    const hfResponse = await fetch('https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
    })

    const contentType = hfResponse.headers.get('content-type')
    let json
    
    try {
      if (contentType?.includes('application/json')) {
        json = await hfResponse.json()
      } else {
        const text = await hfResponse.text()
        json = { error: `Unexpected response format: ${contentType}. Response: ${text}` }
      }
    } catch (parseError) {
      json = { error: `Failed to parse response: ${parseError.message}` }
    }

    if (!hfResponse.ok || json?.error) {
      return {
        status: hfResponse.status || 502,
        body: { error: json?.error || `Hugging Face inference returned ${hfResponse.status}` },
      }
    }

    return {
      status: 200,
      body: json,
    }
  } catch (error) {
    return {
      status: 500,
      body: { error: error?.message || 'Unexpected server error.' },
    }
  }
}
