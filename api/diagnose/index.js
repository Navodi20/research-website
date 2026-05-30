const fetch = require('node-fetch')
const dns = require('dns').promises

module.exports = async function (context, req) {
  const report = {}

  // Test 1: DNS resolution
  try {
    const addresses = await dns.lookup('api-inference.huggingface.co')
    report.dns = { status: 'OK', addresses }
  } catch (e) {
    report.dns = { status: 'FAILED', error: e.message }
  }

  // Test 2: TCP connectivity
  try {
    const res = await fetch('https://api-inference.huggingface.co', {
      method: 'HEAD',
      timeout: 8000,
    })
    report.tcp = { status: 'OK', httpStatus: res.status }
  } catch (e) {
    report.tcp = { status: 'FAILED', error: e.message }
  }

  // Test 3: Auth check
  const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY
  report.apiKey = hfKey
    ? { status: 'PRESENT', prefix: hfKey.substring(0, 8) + '...' }
    : { status: 'MISSING' }

  // Test 4: Actual model ping
  if (hfKey) {
    try {
      const res = await fetch(
        'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: ['test'],
            options: { wait_for_model: false },
          }),
          timeout: 10000,
        }
      )
      const ct = res.headers.get('content-type') || ''
      const body = ct.includes('application/json') ? await res.json() : await res.text()
      report.modelPing = { status: res.status, contentType: ct, body }
    } catch (e) {
      report.modelPing = { status: 'FAILED', error: e.message }
    }
  }

  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report, null, 2),
  }
}

