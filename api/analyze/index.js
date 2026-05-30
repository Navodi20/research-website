const fetch = require('node-fetch')
const dns = require('dns').promises

module.exports = async function (context, req) {
  // ── Always return JSON, never text/plain ──────────────────────────────────
  const JSON_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }

  try {
    // ── Parse request body ────────────────────────────────────────────────
    const request = req || context?.req || context?.request
    const body = request?.body ?? (request?.json ? await request.json() : undefined)

    // Accept BOTH { text: "..." } and { lines: [...] } from frontend
    const text = body?.text
    const lines = body?.lines

    if (!text && (!lines || !Array.isArray(lines) || lines.length === 0)) {
      context.res = {
        status: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: 'Provide either { text } or { lines } in the request body.' }),
      }
      return
    }

    // ── Resolve API key ───────────────────────────────────────────────────
    const hfKey =
      process.env.HUGGINGFACE_API_KEY ||
      process.env.HF_API_KEY ||
      process.env.VITE_HF_API_KEY ||
      process.env.VITE_HUGGINGFACE_API_KEY ||
      process.env.VITE_HF_KEY ||
      process.env.VITE_HUGGING_FACE_API_KEY

    const method = request?.method?.toUpperCase() || 'POST'
    if (method === 'GET') {
      let dnsOk = false
      let dnsError = null
      try {
        await dns.lookup('api-inference.huggingface.co')
        dnsOk = true
      } catch (err) {
        dnsError = err.message
      }

      context.res = {
        status: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          probe: true,
          hfKeyConfigured: !!hfKey,
          dnsOk,
          dnsError,
          host: 'api-inference.huggingface.co',
        }),
      }
      return
    }

    if (!hfKey) {
      context.log.error('HF API key missing from environment variables.')
      context.res = {
        status: 500,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: 'Hugging Face API key not configured. Set HUGGINGFACE_API_KEY in Azure Environment Variables.' }),
      }
      return
    }

    const HF_URL = 'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base'

    const EMOTION_LABELS = ['anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise']

    // ── HF batch call (j-hartmann expects inputs: string[]) with retry ─────
    async function callHFBatch(inputLines, retries = 4) {
      for (let attempt = 1; attempt <= retries; attempt++) {
        const hfRes = await fetch(HF_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: inputLines, // array of strings
            options: { wait_for_model: true },
          }),
        })

        const ct = hfRes.headers.get('content-type') || ''

        if (!ct.includes('application/json')) {
          const raw = await hfRes.text()
          context.log.warn(`HF attempt ${attempt} non-JSON (${hfRes.status}): ${raw.substring(0, 200)}`)

          if (raw.toLowerCase().includes('loading') && attempt < retries) {
            await new Promise(r => setTimeout(r, 5000))
            continue
          }

          if (hfRes.status === 401 || hfRes.status === 403) {
            throw new Error(`HF authentication failed (${hfRes.status}). Check your API key in Azure Environment Variables.`)
          }

          throw new Error(`HF returned non-JSON (${hfRes.status}): ${raw.substring(0, 200)}`)
        }

        const json = await hfRes.json()

        if (json?.error) {
          if (json.error.toLowerCase().includes('loading') && attempt < retries) {
            context.log.warn(`HF model loading (attempt ${attempt}), retrying in 5s...`)
            await new Promise(r => setTimeout(r, 5000))
            continue
          }
          throw new Error(`HF error: ${json.error}`)
        }

        if (!hfRes.ok) {
          throw new Error(`HF returned status ${hfRes.status}`)
        }

        // Expected: [ [ {label, score}, ... ], [ {label, score}, ... ] ]
        if (!Array.isArray(json) || !Array.isArray(json[0])) {
          throw new Error(`Unexpected HF response shape: ${JSON.stringify(json).slice(0, 200)}`)
        }

        return json
      }
      throw new Error('HF inference failed after all retries. Model may still be loading — try again in 30 seconds.')
    }


    // ── Mode A: single text string ────────────────────────────────────────
    if (text) {
      // Mode A: single text string → still send as 1-item batch so response shape is consistent.
      const result = await callHFBatch([text.trim()])
      context.res = {
        status: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify(result),
      }
      return
    }


    // ── Mode B: array of lines (script analysis) ──────────────────────────
    const limit = Math.min(lines.length, 100)
    const allScores = []

    for (let i = 0; i < limit; i++) {
      const line = lines[i]?.trim()
      if (!line) continue

      try {
        const result = await callHFBatch([line])
        // HF batch shape: [ [ {label, score}, ... ] ]
        if (Array.isArray(result) && Array.isArray(result[0])) {
          allScores.push(result[0])
        }

      } catch (lineErr) {
        // Log but don't abort — skip bad lines
        context.log.warn(`Skipping line ${i}: ${lineErr.message}`)
      }
    }

    if (allScores.length === 0) {
      context.res = {
        status: 502,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: 'No valid emotion scores returned from HF. Model may be loading — retry in 30 seconds.' }),
      }
      return
    }

    // Average scores across all lines → { joy: 45.2, anger: 12.1, ... }
    const labelKeys = allScores[0].map(r => r.label)
    const averaged = {}
    labelKeys.forEach(label => {
      const mean = allScores.reduce((sum, lineResult) => {
        const entry = lineResult.find(r => r.label === label)
        return sum + (entry?.score ?? 0)
      }, 0) / allScores.length
      averaged[label] = parseFloat((mean * 100).toFixed(2))
    })

    context.res = {
      status: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        scores: averaged,
        lines_analyzed: allScores.length,
        lines_total: limit,
        model: 'j-hartmann/emotion-english-distilroberta-base',
      }),
    }

  } catch (error) {
    context.log.error('Azure Function error:', error.message)
    context.res = {
      status: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: error?.message || 'Unexpected server error.' }),
    }
  }
}
