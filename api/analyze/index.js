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
      console.error('HF API key missing. Checked: HUGGINGFACE_API_KEY, VITE_HF_API_KEY, VITE_HUGGINGFACE_API_KEY, HF_API_KEY, VITE_HF_KEY, VITE_HUGGING_FACE_API_KEY')
      return {
        status: 500,
        body: { error: 'Hugging Face API key not configured. Set HUGGINGFACE_API_KEY in environment variables.' },
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
    let responseText = ''
    
    try {
      if (contentType?.includes('application/json')) {
        json = await hfResponse.json()
      } else {
        responseText = await hfResponse.text()
        json = { error: `HF returned ${hfResponse.status} with content-type: ${contentType}. Response: ${responseText.substring(0, 200)}` }
      }
    } catch (parseError) {
      json = { error: `Failed to parse HF response: ${parseError.message}` }
    }

    if (!hfResponse.ok) {
      console.error('HF API Error:', { status: hfResponse.status, contentType, error: json.error })
      return {
        status: hfResponse.status || 502,
        body: { error: json?.error || `Hugging Face inference returned ${hfResponse.status}` },
      }
    }

    if (json?.error) {
      console.error('HF Response Error:', json.error)
      return {
        status: 502,
        body: { error: json.error },
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
