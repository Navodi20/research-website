/**
 * AniEmo — Self-Contained Emotion Analysis Function
 * Primary: local lexicon engine (always works, zero external calls)
 * Optional: j-hartmann/emotion-english-distilroberta-base via HF Inference API
 *           (used when HUGGINGFACE_API_KEY / HF_API_KEY / VITE_HF_API_KEY is set)
 */

// ── Emotion Lexicon ──────────────────────────────────────────────────────────
const LEXICON = {
  // JOY
  love:{joy:0.92,surprise:0.05},loved:{joy:0.90},loving:{joy:0.88},happy:{joy:0.95},
  happiness:{joy:0.93},joy:{joy:0.97},joyful:{joy:0.94},smile:{joy:0.78},smiling:{joy:0.76},
  laugh:{joy:0.80},laughing:{joy:0.78},laughter:{joy:0.80},wonderful:{joy:0.87},
  amazing:{joy:0.85,surprise:0.15},beautiful:{joy:0.80},gorgeous:{joy:0.82},
  fantastic:{joy:0.88},excellent:{joy:0.84},brilliant:{joy:0.83},great:{joy:0.72},
  good:{joy:0.55},nice:{joy:0.58},perfect:{joy:0.87},best:{joy:0.75},blessed:{joy:0.80},
  grateful:{joy:0.76},thankful:{joy:0.73},glad:{joy:0.74},pleased:{joy:0.70},
  delighted:{joy:0.88},excited:{joy:0.82,surprise:0.18},thrilled:{joy:0.87},proud:{joy:0.78},
  confident:{joy:0.65},celebrate:{joy:0.85,surprise:0.10},celebration:{joy:0.85},
  party:{joy:0.72},fun:{joy:0.75},enjoy:{joy:0.72},enjoying:{joy:0.70},pleasure:{joy:0.74},
  peaceful:{joy:0.65},together:{joy:0.55},friend:{joy:0.60},friends:{joy:0.62},
  family:{joy:0.58,sadness:0.10},home:{joy:0.52,sadness:0.08},hope:{joy:0.65},
  dream:{joy:0.60,surprise:0.08},dreams:{joy:0.60},wish:{joy:0.55},precious:{joy:0.75},
  treasure:{joy:0.72},warm:{joy:0.58},warmth:{joy:0.60},gentle:{joy:0.55},kind:{joy:0.60},
  kindness:{joy:0.65},trust:{joy:0.60},freedom:{joy:0.70},alive:{joy:0.65},
  victory:{joy:0.80,surprise:0.10},win:{joy:0.78},won:{joy:0.78},winner:{joy:0.80},
  succeed:{joy:0.78},success:{joy:0.80},achieve:{joy:0.74},save:{joy:0.68,fear:0.08},
  saved:{joy:0.70},protect:{joy:0.60,fear:0.10},safe:{joy:0.65},
  miracle:{joy:0.78,surprise:0.20},finally:{joy:0.55,surprise:0.15},
  forever:{joy:0.55,sadness:0.15},remember:{joy:0.40,sadness:0.30},
  reunion:{joy:0.75,surprise:0.10},promise:{joy:0.55},believe:{joy:0.60},
  heart:{joy:0.45,sadness:0.20},sunshine:{joy:0.70},flower:{joy:0.60},
  light:{joy:0.55,surprise:0.05},bright:{joy:0.60},glow:{joy:0.55},
  sparkle:{joy:0.65,surprise:0.10},sparkles:{joy:0.65},cherish:{joy:0.78},
  // SADNESS
  sad:{sadness:0.92},sadness:{sadness:0.94},cry:{sadness:0.88},crying:{sadness:0.87},
  cried:{sadness:0.86},tears:{sadness:0.85},tear:{sadness:0.82},weep:{sadness:0.88},
  weeping:{sadness:0.87},sob:{sadness:0.88},sobbing:{sadness:0.87},miss:{sadness:0.75},
  missing:{sadness:0.74},alone:{sadness:0.80},lonely:{sadness:0.87},loneliness:{sadness:0.88},
  pain:{sadness:0.78,fear:0.12},painful:{sadness:0.80},hurt:{sadness:0.74,anger:0.15},
  hurting:{sadness:0.74},suffer:{sadness:0.82},suffering:{sadness:0.83},loss:{sadness:0.85},
  lost:{sadness:0.70},lose:{sadness:0.68},gone:{sadness:0.72},leave:{sadness:0.55},
  leaving:{sadness:0.60},left:{sadness:0.60},goodbye:{sadness:0.80},farewell:{sadness:0.82},
  apart:{sadness:0.68},separated:{sadness:0.72},die:{sadness:0.90,fear:0.08},
  died:{sadness:0.92,fear:0.06},dying:{sadness:0.88,fear:0.10},dead:{sadness:0.88,fear:0.08},
  death:{sadness:0.88,fear:0.10},killed:{sadness:0.85,anger:0.10},
  murder:{sadness:0.75,anger:0.15,fear:0.08},grief:{sadness:0.93},grieve:{sadness:0.92},
  mourning:{sadness:0.90},mourn:{sadness:0.90},sorrow:{sadness:0.90},sorrowful:{sadness:0.90},
  regret:{sadness:0.78},remorse:{sadness:0.82},guilt:{sadness:0.75,disgust:0.10},
  ashamed:{sadness:0.70,disgust:0.15},shame:{sadness:0.72,disgust:0.14},
  broken:{sadness:0.78,anger:0.12},shattered:{sadness:0.82,surprise:0.08},
  empty:{sadness:0.80},hollow:{sadness:0.78},numb:{sadness:0.75},hopeless:{sadness:0.88},
  despair:{sadness:0.92},desperate:{sadness:0.82,fear:0.10},darkness:{sadness:0.75,fear:0.15},
  dark:{sadness:0.45,fear:0.30},shadow:{sadness:0.50,fear:0.20},cold:{sadness:0.48},
  silent:{sadness:0.45},silence:{sadness:0.50},disappear:{sadness:0.70},
  disappeared:{sadness:0.72},forgotten:{sadness:0.78},forget:{sadness:0.65},
  forgive:{sadness:0.50,joy:0.20},sorry:{sadness:0.60},apologize:{sadness:0.55},
  apology:{sadness:0.52},sacrifice:{sadness:0.75,joy:0.10},
  // ANGER
  angry:{anger:0.93},anger:{anger:0.95},furious:{anger:0.96},rage:{anger:0.97},
  enraged:{anger:0.95},mad:{anger:0.82},irate:{anger:0.90},outraged:{anger:0.92},
  livid:{anger:0.94},hate:{anger:0.88,disgust:0.10},hatred:{anger:0.90,disgust:0.08},
  despise:{anger:0.85,disgust:0.12},loathe:{anger:0.85,disgust:0.13},
  resent:{anger:0.80},resentment:{anger:0.82},hostile:{anger:0.85},
  aggression:{anger:0.88},aggressive:{anger:0.85},violent:{anger:0.85,fear:0.10},
  violence:{anger:0.83,fear:0.12},attack:{anger:0.78,fear:0.15},
  attacking:{anger:0.78,fear:0.14},kill:{anger:0.80,fear:0.15},killing:{anger:0.80,fear:0.14},
  destroy:{anger:0.82},destruction:{anger:0.80},crush:{anger:0.75},
  punish:{anger:0.78},punishment:{anger:0.76},revenge:{anger:0.87},vengeance:{anger:0.90},
  betray:{anger:0.88,sadness:0.10},betrayal:{anger:0.90,sadness:0.08},
  betrayed:{anger:0.88,sadness:0.10},liar:{anger:0.80,disgust:0.12},
  lie:{anger:0.72,disgust:0.10},lying:{anger:0.74,disgust:0.10},
  cheat:{anger:0.80,disgust:0.12},cheated:{anger:0.80},unfair:{anger:0.78},
  injustice:{anger:0.85},cruel:{anger:0.80,disgust:0.15},cruelty:{anger:0.82,disgust:0.14},
  heartless:{anger:0.80,sadness:0.10},monster:{anger:0.65,fear:0.20,disgust:0.12},
  enemy:{anger:0.70,fear:0.15},enemies:{anger:0.70,fear:0.15},fight:{anger:0.72,fear:0.12},
  fighting:{anger:0.72,fear:0.10},battle:{anger:0.65,fear:0.15},war:{anger:0.68,fear:0.25},
  weapon:{anger:0.60,fear:0.25},blood:{anger:0.55,fear:0.25,disgust:0.15},damn:{anger:0.68},
  hell:{anger:0.55,fear:0.15},stupid:{anger:0.68,disgust:0.18},idiot:{anger:0.72,disgust:0.18},
  fool:{anger:0.65,disgust:0.12},wrong:{anger:0.50,disgust:0.18},
  // FEAR
  fear:{fear:0.94},afraid:{fear:0.90},scared:{fear:0.92},frightened:{fear:0.92},
  terrified:{fear:0.96},terror:{fear:0.96},horrified:{fear:0.94},
  horror:{fear:0.90,disgust:0.08},panic:{fear:0.90,surprise:0.08},panicking:{fear:0.88},
  dread:{fear:0.88},dreading:{fear:0.86},nightmare:{fear:0.85,sadness:0.10},
  nightmares:{fear:0.85},danger:{fear:0.85},dangerous:{fear:0.83},threat:{fear:0.82},
  threatening:{fear:0.82},menace:{fear:0.80},menacing:{fear:0.80},
  sinister:{fear:0.82,disgust:0.08},evil:{fear:0.65,anger:0.20,disgust:0.12},
  demon:{fear:0.75,disgust:0.12},curse:{fear:0.72},cursed:{fear:0.74},
  trapped:{fear:0.85},escape:{fear:0.65},run:{fear:0.55},running:{fear:0.52},
  hide:{fear:0.68},hiding:{fear:0.67},helpless:{fear:0.82,sadness:0.14},
  powerless:{fear:0.78,sadness:0.14},weak:{fear:0.55,sadness:0.22},vulnerable:{fear:0.72},
  nervous:{fear:0.70},anxiety:{fear:0.78},anxious:{fear:0.76},worry:{fear:0.70},
  worried:{fear:0.72},risk:{fear:0.60},uncertain:{fear:0.58},suspicious:{fear:0.58,anger:0.15},
  // DISGUST
  disgust:{disgust:0.94},disgusting:{disgust:0.93},gross:{disgust:0.90},revolting:{disgust:0.92},
  repulsive:{disgust:0.92},repel:{disgust:0.88},nauseating:{disgust:0.88},nausea:{disgust:0.85},
  vomit:{disgust:0.90},filthy:{disgust:0.88},nasty:{disgust:0.85},vile:{disgust:0.92},
  awful:{disgust:0.75,sadness:0.12},horrible:{disgust:0.80,fear:0.10},
  dreadful:{disgust:0.75,fear:0.15},corrupt:{disgust:0.82,anger:0.12},
  corrupted:{disgust:0.80},rotten:{disgust:0.85},rot:{disgust:0.82},decay:{disgust:0.80},
  poison:{disgust:0.78,fear:0.15},toxic:{disgust:0.80,anger:0.10},waste:{disgust:0.65},
  dirty:{disgust:0.75},filth:{disgust:0.88},trash:{disgust:0.72,anger:0.15},
  wretched:{disgust:0.80,sadness:0.12},pathetic:{disgust:0.72,anger:0.15},
  hypocrite:{disgust:0.80,anger:0.15},selfish:{disgust:0.70,anger:0.18},
  // SURPRISE
  surprised:{surprise:0.92},surprise:{surprise:0.93},shocked:{surprise:0.90,fear:0.08},
  shocking:{surprise:0.88},astonished:{surprise:0.93},astonishing:{surprise:0.92},
  astounded:{surprise:0.93},amazed:{surprise:0.88,joy:0.10},incredible:{surprise:0.85,joy:0.12},
  unbelievable:{surprise:0.88},impossible:{surprise:0.82},unexpected:{surprise:0.85},
  unimaginable:{surprise:0.88},sudden:{surprise:0.75},suddenly:{surprise:0.72},
  abrupt:{surprise:0.70},reveal:{surprise:0.80},revelation:{surprise:0.85},
  discover:{surprise:0.72,joy:0.10},discovered:{surprise:0.74},secret:{surprise:0.65,fear:0.10},
  twist:{surprise:0.80},truth:{surprise:0.60,sadness:0.10},realize:{surprise:0.68},
  realizing:{surprise:0.65},wait:{surprise:0.45},really:{surprise:0.38},
  seriously:{surprise:0.42},wow:{surprise:0.92,joy:0.06},whoa:{surprise:0.90},
  gasp:{surprise:0.85,fear:0.08},
  // NEUTRAL
  okay:{neutral:0.80},ok:{neutral:0.80},fine:{neutral:0.70},sure:{neutral:0.65},
  right:{neutral:0.60},yes:{neutral:0.55},yeah:{neutral:0.55},no:{neutral:0.55},
  maybe:{neutral:0.70},probably:{neutral:0.65},think:{neutral:0.50},know:{neutral:0.50},
  understand:{neutral:0.55},need:{neutral:0.48},want:{neutral:0.48},come:{neutral:0.40},
  go:{neutral:0.40},look:{neutral:0.42},see:{neutral:0.42},tell:{neutral:0.42},
  say:{neutral:0.40},time:{neutral:0.45},place:{neutral:0.42},day:{neutral:0.42},
  back:{neutral:0.40},still:{neutral:0.40},
}

const EMOTION_KEYS = ['anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise']
const NEGATIONS  = new Set(['not', "n't", 'never', 'no', 'neither', 'nor', 'barely', 'hardly', 'scarcely', 'without', 'nothing'])
const INTENSIFIERS = new Set(['very', 'so', 'extremely', 'really', 'absolutely', 'deeply', 'utterly', 'totally', 'completely', 'incredibly', 'terribly', 'awfully', 'desperately', 'overwhelmingly'])
const DIMINISHERS  = new Set(['slightly', 'somewhat', 'rather', 'fairly', 'little', 'almost', 'nearly'])
const FLIP_MAP = { joy:'sadness', sadness:'joy', fear:'surprise', surprise:'fear', anger:'neutral', disgust:'neutral', neutral:'neutral' }

function analyzeOneLine(text) {
  const tokens = text.toLowerCase().replace(/[^a-z\s']/g, ' ').split(/\s+/).filter(Boolean)
  const scores = { anger:0, disgust:0, fear:0, joy:0, neutral:0, sadness:0, surprise:0 }
  let matchCount = 0, negated = false, boost = 1.0, negWin = 0

  for (const token of tokens) {
    if (NEGATIONS.has(token))   { negated = true; negWin = 0; continue }
    if (INTENSIFIERS.has(token)) { boost = 1.5; continue }
    if (DIMINISHERS.has(token))  { boost = 0.6; continue }
    if (negated) { negWin++; if (negWin > 3) { negated = false; negWin = 0 } }

    const entry = LEXICON[token]
    if (!entry) continue
    matchCount++
    const b = boost
    if (negated) {
      for (const [emo, w] of Object.entries(entry)) scores[FLIP_MAP[emo] || emo] += w * b
    } else {
      for (const [emo, w] of Object.entries(entry)) scores[emo] += w * b
    }
    boost = 1.0
  }

  const total = EMOTION_KEYS.reduce((s, k) => s + scores[k], 0)
  if (total === 0 || matchCount === 0) {
    return { anger:0.02, disgust:0.01, fear:0.02, joy:0.08, neutral:0.82, sadness:0.03, surprise:0.02 }
  }

  const result = {}
  for (const k of EMOTION_KEYS) result[k] = scores[k] / total
  return result
}

function averageScores(allRatios) {
  const averaged = {}
  for (const k of EMOTION_KEYS) {
    const mean = allRatios.reduce((s, r) => s + (r[k] || 0), 0) / allRatios.length
    averaged[k] = parseFloat((mean * 100).toFixed(2))
  }
  return averaged
}

// ── Optional HF call (best-effort) ──────────────────────────────────────────
async function tryHuggingFace(inputLines, hfKey, context) {
  let fetch
  try { fetch = require('node-fetch') } catch (_) { return null }

  const HF_URL = 'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base'
  const BATCH = 32
  const allResults = []

  for (let i = 0; i < inputLines.length; i += BATCH) {
    const batch = inputLines.slice(i, i + BATCH)
    let res
    try {
      res = await fetch(HF_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${hfKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: batch, options: { wait_for_model: true, use_cache: false } }),
        timeout: 30000,
      })
    } catch (e) { throw new Error(`Network: ${e.message}`) }

    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      const raw = await res.text()
      throw new Error(`HF non-JSON (${res.status}): ${raw.slice(0, 100)}`)
    }
    const json = await res.json()
    if (json?.error) throw new Error(`HF: ${json.error}`)
    if (!Array.isArray(json) || !Array.isArray(json[0])) throw new Error('HF bad shape')
    allResults.push(...json)
  }

  if (allResults.length === 0) return null

  const labels = allResults[0].map(r => r.label)
  const averaged = {}
  for (const label of labels) {
    const mean = allResults.reduce((sum, line) => {
      const e = line.find(x => x.label === label)
      return sum + (e?.score ?? 0)
    }, 0) / allResults.length
    averaged[label] = parseFloat((mean * 100).toFixed(2))
  }
  return { scores: averaged, linesAnalyzed: allResults.length }
}

// ── Azure Function handler ───────────────────────────────────────────────────
const JSON_HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

module.exports = async function (context, req) {
  try {
    const body = req?.body ?? (req?.json ? await req.json() : undefined)
    const lines     = body?.lines
    const text      = body?.text
    const forceLocal = body?.forceLocal === true

    if (!lines && !text) {
      context.res = { status: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Provide { lines: string[] } or { text: string }' }) }
      return
    }

    const inputLines = text
      ? [text.trim()]
      : lines.slice(0, 100).map(l => l?.trim()).filter(l => l && l.length > 2)

    if (inputLines.length === 0) {
      context.res = { status: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'No valid lines after filtering.' }) }
      return
    }

    const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || process.env.VITE_HF_API_KEY || process.env.VITE_HF_KEY

    // Try HF first when a key is available
    if (hfKey && !forceLocal) {
      try {
        const hfResult = await tryHuggingFace(inputLines, hfKey, context)
        if (hfResult) {
          context.res = {
            status: 200,
            headers: JSON_HEADERS,
            body: JSON.stringify({
              scores: hfResult.scores,
              lines_analyzed: hfResult.linesAnalyzed,
              lines_total: inputLines.length,
              model: 'j-hartmann/emotion-english-distilroberta-base',
              source: 'huggingface',
            }),
          }
          return
        }
      } catch (hfErr) {
        context.log.warn(`HF unavailable: ${hfErr.message} — falling back to local engine`)
      }
    }

    // Local lexicon engine — always succeeds
    context.log.info(`Local engine: ${inputLines.length} lines`)
    const scores = averageScores(inputLines.map(analyzeOneLine))

    context.res = {
      status: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        scores,
        lines_analyzed: inputLines.length,
        lines_total: inputLines.length,
        model: 'local-lexicon-v2',
        source: 'local',
        note: hfKey ? 'HF unavailable, used local model' : 'No HF key configured, used local model',
      }),
    }

  } catch (err) {
    context.log.error('Function error:', err.message)
    context.res = { status: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: err.message }) }
  }
}
