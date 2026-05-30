import { useEffect, useState } from 'react'
import animeDataset from '../data/animeDataset.json'
import './Home.css'

const EMOTIONS = [
  { key: 'anger', label: 'Anger', color: '#f87171', default: 10 },
  { key: 'disgust', label: 'Disgust', color: '#fb923c', default: 10 },
  { key: 'fear', label: 'Fear', color: '#fbbf24', default: 10 },
  { key: 'joy', label: 'Joy', color: '#34d399', default: 50 },
  { key: 'sadness', label: 'Sadness', color: '#60a5fa', default: 10 },
  { key: 'surprise', label: 'Surprise', color: '#c084fc', default: 10 },
]

const SCRIPT_EMOTIONS = [
  { key: 'angry', label: 'Angry', color: '#f87171' },
  { key: 'disgust', label: 'Disgust', color: '#fb923c' },
  { key: 'fear', label: 'Fear', color: '#fbbf24' },
  { key: 'happy', label: 'Happy', color: '#34d399' },
  { key: 'neutral', label: 'Neutral', color: '#94a3b8' },
  { key: 'sad', label: 'Sad', color: '#60a5fa' },
  { key: 'surprise', label: 'Surprise', color: '#c084fc' },
]

const SCRIPT_EMOTION_KEYWORDS = {
  angry: ['angry', 'anger', 'rage', 'kill', 'fight', 'attack', 'hate', 'furious', 'violent', 'scream'],
  disgust: ['disgust', 'disgusting', 'gross', 'nasty', 'sick', 'dirty', 'filth', 'rotten', 'revolting', 'vomit'],
  fear: ['fear', 'afraid', 'scared', 'terrified', 'panic', 'horror', 'danger', 'threat', 'fright', 'nervous'],
  happy: ['happy', 'joy', 'joyful', 'smile', 'laugh', 'cheer', 'delight', 'love', 'excited', 'sunny', 'bright'],
  neutral: ['okay', 'fine', 'clear', 'routine', 'normal', 'neutral', 'steady', 'simple', 'matter', 'detail'],
  sad: ['sad', 'sorrow', 'cry', 'tears', 'lonely', 'mourn', 'grief', 'hurt', 'regret', 'depressed'],
  surprise: ['surprise', 'surprised', 'wow', 'shock', 'shocked', 'unexpected', 'astonished', 'sudden', 'amazing', 'incredible'],
}

const ANIME_DB = animeDataset

const initialSliders = EMOTIONS.reduce((acc, emotion) => {
  acc[emotion.key] = emotion.default
  return acc
}, {})

const initialScriptResults = SCRIPT_EMOTIONS.reduce((acc, emotion) => {
  acc[emotion.key] = 0
  return acc
}, {})

export default function Home() {
  const [activeTab, setActiveTab] = useState('recommend')
  const [sliders, setSliders] = useState(initialSliders)
  const [alpha, setAlpha] = useState(0.7)
  const [anchors, setAnchors] = useState({ ti: 0, eb: 0, pi: 0 })
  const [showResults, setShowResults] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [vibeText, setVibeText] = useState('—')
  const [uploadedLines, setUploadedLines] = useState([])
  const [fileName, setFileName] = useState('—')
  const [fileLines, setFileLines] = useState(0)
  const [uploadedText, setUploadedText] = useState('')
  const [analysisReady, setAnalysisReady] = useState(false)
  const [analysisRunning, setAnalysisRunning] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [scriptResults, setScriptResults] = useState(initialScriptResults)
  const [scriptSummary, setScriptSummary] = useState('—')
  const [scriptSource, setScriptSource] = useState(null)

  useEffect(() => {
    setAnchors(computeAnchors(sliders))
  }, [sliders])

  function handleSliderChange(key, value) {
    setSliders((prev) => ({ ...prev, [key]: Number(value) }))
  }

  function computeAnchors(vals) {
    const entries = Object.values(vals)
    const ti = entries.reduce((total, v) => total + v, 0)
    const eb = entries.filter((v) => v > 10).length
    const pi = (vals.joy + vals.surprise) - (vals.anger + vals.disgust + vals.fear + vals.sadness)
    return { ti, eb, pi }
  }

  function intensityLabel(v) {
    if (v > 75) return 'extreme'
    if (v > 50) return 'high'
    if (v > 20) return 'moderate'
    return 'subtle'
  }

  function generateVibeDesc(vals) {
    const sorted = Object.entries(vals).sort((a, b) => b[1] - a[1])
    const primary = `${intensityLabel(sorted[0][1])} ${sorted[0][0]}`
    const secondary = `${intensityLabel(sorted[1][1])} ${sorted[1][0]} and ${intensityLabel(sorted[2][1])} ${sorted[2][0]}`
    const traces = `${sorted[3][0]}, ${sorted[4][0]}, and ${sorted[5][0]}`
    return `An episode defined by ${primary}, with ${secondary}, and subtle traces of ${traces}.`
  }

  function minMaxNorm(arr) {
    const mn = Math.min(...arr)
    const mx = Math.max(...arr)
    return arr.map((v) => (v - mn) / (mx - mn + 1e-9))
  }

  function cosineSim(a, b) {
    let dot = 0
    let na = 0
    let nb = 0
    for (let i = 0; i < a.length; i += 1) {
      dot += a[i] * b[i]
      na += a[i] * a[i]
      nb += b[i] * b[i]
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9)
  }

  function computePreferenceScore(row) {
    const weights = { anger: 0.6, disgust: 0.5, fear: 0.6, joy: 0.7, sadness: 0.7, surprise: 0.6 }
    return EMOTIONS.reduce((score, emotion) => score + row[emotion.key] * weights[emotion.key], 0)
  }

  function runRecommendation() {
    const currentAnchors = computeAnchors(sliders)
    const userScore = computePreferenceScore(sliders)
    const dbScores = ANIME_DB.map((anime) => computePreferenceScore(anime))
    const absDiff = dbScores.map((score) => Math.abs(score - userScore))
    const tabSims = minMaxNorm(absDiff.map((d) => -d))
    const userVec = EMOTIONS.map((emotion) => sliders[emotion.key])
    const semSims = ANIME_DB.map((anime) => {
      const dbVec = EMOTIONS.map((emotion) => anime[emotion.key])
      return cosineSim(userVec, dbVec)
    })
    const semNorm = minMaxNorm(semSims)

    const finalScores = ANIME_DB.map((anime, index) => ({
      ...anime,
      tabular: tabSims[index],
      semantic: semNorm[index],
      final: alpha * tabSims[index] + (1 - alpha) * semNorm[index],
    }))

    const top5 = [...finalScores]
      .sort((a, b) => b.final - a.final)
      .filter(
        (value, index, array) =>
          array.findIndex(
            (item) => item.anime_name === value.anime_name && item.episode_name === value.episode_name
          ) === index
      )
      .slice(0, 5)

    setAnchors(currentAnchors)
    setVibeText(generateVibeDesc(sliders))
    setRecommendations(top5)
    setShowResults(true)
  }

  function handleFileUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setAnalysisError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result || ''
      const lines = String(content)
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !/^\d+$/.test(line) && !/^\d{2}:\d{2}/.test(line))

      setUploadedText(String(content))
      setUploadedLines(lines)
      setFileName(file.name)
      setFileLines(lines.length)
      setAnalysisReady(lines.length > 0)
    }
    reader.readAsText(file)
  }

  function handleDrop(event) {
    event.preventDefault()
    event.stopPropagation()
    const file = event.dataTransfer?.files?.[0]
    if (!file) return
    const fileInput = document.getElementById('file-input')
    if (fileInput) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      fileInput.files = dataTransfer.files
    }
    handleFileUpload({ target: { files: [file] } })
  }

  function handleDragOver(event) {
    event.preventDefault()
    event.stopPropagation()
  }

  function normalizeScriptScores(counts) {
    // Match Colab: use model outputs directly, only normalize to percentages.
    const sum = Object.values(counts).reduce((total, value) => total + value, 0) || 1
    return Object.keys(counts).reduce((result, key) => {
      result[key] = (counts[key] / sum) * 100
      return result
    }, {})
  }

  function mapHfLabelToKey(label) {

    const mapping = {
      angry: 'angry',
      anger: 'angry',
      disgust: 'disgust',
      fear: 'fear',
      joy: 'happy',
      happiness: 'happy',
      neutral: 'neutral',
      sadness: 'sad',
      sad: 'sad',
      surprise: 'surprise',
    }
    return mapping[label.toLowerCase()] || 'neutral'
  }

  async function analyzeWithHuggingFaceLines(lines) {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines }),
    })

    let result = null
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      result = await response.json()
    } else {
      const text = await response.text()
      throw new Error(`Inference error (${response.status}): ${text || response.statusText}`)
    }

    if (!response.ok) {
      throw new Error(result?.error || `Inference failed (${response.status})`)
    }

    const counts = { angry: 0, disgust: 0, fear: 0, happy: 0, neutral: 0, sad: 0, surprise: 0 }

    if (result?.scores && typeof result.scores === 'object') {
      for (const [label, score] of Object.entries(result.scores)) {
        const key = mapHfLabelToKey(label || '')
        counts[key] += Number(score) || 0
      }
      return { counts, source: result.source || 'unknown', linesAnalyzed: result.lines_analyzed || lines.length }
    }

    // Old backend shape fallback: [[{label, score}, ...]]
    if (Array.isArray(result)) {
      const flat = Array.isArray(result[0]) ? result[0] : result
      for (const item of flat) {
        const key = mapHfLabelToKey(item.label || '')
        counts[key] += item.score || 0
      }
      return { counts, source: 'huggingface', linesAnalyzed: lines.length }
    }

    throw new Error('Unexpected inference API response format.')
  }

  async function generateScriptResults(text) {
    const lines = String(text)
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !/^\d+$/.test(line) && !/^\d{2}:\d{2}/.test(line))

    if (!lines.length) {
      throw new Error('No valid dialogue lines found in the uploaded script.')
    }

    const sample = lines.slice(0, Math.min(25, lines.length))
    const { counts, source, linesAnalyzed } = await analyzeWithHuggingFaceLines(sample)
    return { scores: normalizeScriptScores(counts), source, linesAnalyzed }
  }


  function getScriptKeywordCounts(text) {
    const normalized = String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
    const tokens = normalized.split(/\s+/).filter(Boolean)
    const counts = Object.keys(SCRIPT_EMOTION_KEYWORDS).reduce((obj, key) => {
      obj[key] = 0
      return obj
    }, {})

    for (const token of tokens) {
      for (const [key, keywords] of Object.entries(SCRIPT_EMOTION_KEYWORDS)) {
        if (keywords.includes(token)) {
          counts[key] += 1
        }
      }
    }

    return counts
  }

  async function runScriptAnalysis() {
    if (!analysisReady) return

    setAnalysisError('')
    setAnalysisRunning(true)
    setScriptResults(initialScriptResults)
    setScriptSummary('—')
    setScriptSource(null)
    setShowResults(true)

    try {
      const { scores: results, source, linesAnalyzed } = await generateScriptResults(uploadedText)
      setScriptResults(results)
      setScriptSource(source)

      const sorted = [...SCRIPT_EMOTIONS].sort((a, b) => results[b.key] - results[a.key])
      const top3 = sorted.slice(0, 3)
      const engineLabel = source === 'local' ? 'Local lexicon engine' : 'DistilRoBERTa · HF'
      setScriptSummary(
        `The script's dominant emotional signature is ${top3[0].label.toLowerCase()} (${results[top3[0].key].toFixed(1)}%), with notable presence of ${top3[1].label.toLowerCase()} (${results[top3[1].key].toFixed(1)}%) and ${top3[2].label.toLowerCase()} (${results[top3[2].key].toFixed(1)}%). ${engineLabel} averaged across ${linesAnalyzed} dialogue lines.`
      )
    } catch (error) {
      setAnalysisError(error?.message || 'Analysis failed.')
      setScriptSummary('—')
    } finally {
      setAnalysisRunning(false)
    }
  }

  return (
    <div className="aniemo-page">
      <div className="orb2" />
      <header>
        <div className="header-inner">
          <div className="logo">
            <div className="logo-mark">AE</div>
            <div className="logo-text">Ani<span>Emo</span></div>
          </div>
          <div className="header-badge">Dissertation Research System v2.0</div>
          <div className="nav-pills">
            <button className={`nav-pill ${activeTab === 'recommend' ? 'active' : ''}`} onClick={() => setActiveTab('recommend')}>
              Recommendation
            </button>
            <button className={`nav-pill ${activeTab === 'script' ? 'active' : ''}`} onClick={() => setActiveTab('script')}>
              Script Analysis
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="hero fade-up">
          <div className="hero-label">Hybrid ML System — 9D Emotion Space</div>
          <h1>Emotion-Driven<br />Anime Intelligence</h1>
          <p className="hero-sub">
            Combining regularized XGBoost tabular scoring with semantic vibe fusion for research-grade anime recommendations
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">9D</div>
              <div className="hero-stat-label">Feature Space</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">XGB</div>
              <div className="hero-stat-label">Tabular Engine</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">MiniLM</div>
              <div className="hero-stat-label">Semantic Layer</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">7-cls</div>
              <div className="hero-stat-label">RoBERTa NLP</div>
            </div>
          </div>
        </div>

        <div id="tab-recommend" className={`rec-panel-content ${activeTab !== 'recommend' ? 'hidden' : ''}`}>
          <div className="main-layout">
            <div>
              <div className="panel fade-up delay-1" style={{ marginBottom: 16 }}>
                <div className="panel-header">
                  <div className="panel-icon" style={{ background: 'rgba(192,132,252,0.1)' }}>🎭</div>
                  <div className="panel-title">Emotion Profile</div>
                </div>
                <div className="panel-body">
                  {EMOTIONS.map((emotion) => (
                    <div className="emotion-slider-group" key={emotion.key}>
                      <div className="slider-header">
                        <div className="slider-label">
                          <div className="emotion-dot" style={{ background: emotion.color }} />
                          <span>{emotion.label}</span>
                        </div>
                        <span className="slider-value">{sliders[emotion.key]}%</span>
                      </div>
                      <input
                        type="range"
                        className="emotion-range"
                        value={sliders[emotion.key]}
                        min="0"
                        max="100"
                        step="1"
                        style={{ background: `linear-gradient(90deg, ${emotion.color} ${sliders[emotion.key]}%, var(--surface3) ${sliders[emotion.key]}%)` }}
                        onChange={(event) => handleSliderChange(emotion.key, event.target.value)}
                      />
                    </div>
                  ))}

                  <div className="alpha-control">
                    <div className="alpha-header">
                      <span className="alpha-label">FUSION WEIGHT (alpha)</span>
                      <span className="slider-value">{alpha.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      className="emotion-range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={alpha}
                      onChange={(event) => setAlpha(Number(event.target.value))}
                      style={{ background: 'linear-gradient(90deg, var(--accent2) 0%, var(--accent) 100%)', width: '100%' }}
                    />
                    <div className="alpha-badges">
                      <div className="alpha-badge" style={{ background: 'rgba(192,132,252,0.1)', color: 'var(--accent)', border: '1px solid rgba(192,132,252,0.2)' }}>
                        XGB <span>{Math.round(alpha * 100)}%</span>
                      </div>
                      <div className="alpha-badge" style={{ background: 'rgba(129,140,248,0.1)', color: 'var(--accent2)', border: '1px solid rgba(129,140,248,0.2)' }}>
                        SEM <span>{Math.round((1 - alpha) * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <button className="run-btn" onClick={runRecommendation}>
                    &#9654; Run Hybrid Engine
                  </button>

                  <div className="arch-tags">
                    <span className="arch-tag">XGBoost lambda=15</span>
                    <span className="arch-tag">n_est=300</span>
                    <span className="arch-tag">MiniLM-L6</span>
                    <span className="arch-tag">cosine sim</span>
                    <span className="arch-tag">min-max norm</span>
                  </div>
                </div>
              </div>

              <div className="panel fade-up delay-2">
                <div className="panel-header">
                  <div className="panel-icon" style={{ background: 'rgba(129,140,248,0.1)' }}>📐</div>
                  <div className="panel-title">Anchor Features</div>
                </div>
                <div className="panel-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Intensity</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--accent)' }}>{anchors.ti.toFixed(0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Emotion Breadth</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--accent2)' }}>{anchors.eb}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Positivity Index</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--green)' }}>{anchors.pi >= 0 ? '+' : ''}{anchors.pi.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="results-panel" id="results-area">
              <div id="placeholder-state" style={{ display: showResults ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--surface2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, opacity: 0.4 }}>🎬</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>Configure & Run</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Set emotion sliders and click Run Hybrid Engine</div>
                </div>
              </div>

              <div id="results-content" style={{ display: showResults ? 'block' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div className="section-label" style={{ marginBottom: 0, flex: 1 }}>
                    <span className="section-label-text">Query Profile</span>
                    <div className="section-label-line" />
                  </div>
                  <div className="status-pill running" style={{ marginLeft: 12 }}>
                    <div className="status-dot" />
                    <span>Engine Active</span>
                  </div>
                </div>

                <div className="metrics-row">
                  <div className="metric-card">
                    <div className="metric-label">Total Intensity</div>
                    <div className="metric-value" style={{ color: 'var(--accent)' }}>{anchors.ti.toFixed(0)}</div>
                    <div className="metric-sub">sum of all emotion scores</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Breadth</div>
                    <div className="metric-value" style={{ color: 'var(--accent2)' }}>{anchors.eb}</div>
                    <div className="metric-sub">active emotions &gt;10%</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Positivity Index</div>
                    <div className="metric-value" style={{ color: 'var(--green)' }}>{anchors.pi >= 0 ? '+' : ''}{anchors.pi.toFixed(0)}</div>
                    <div className="metric-sub">joy+surprise − neg</div>
                  </div>
                </div>

                <div className="vibe-card">
                  <div className="vibe-title">Generated Semantic Vibe</div>
                  <div className="vibe-text">{vibeText}</div>
                </div>

                <div className="emotion-viz">
                  <div className="section-label">
                    <span className="section-label-text">Emotion Distribution</span>
                    <div className="section-label-line" />
                  </div>
                  <div className="emotion-bars">
                    {EMOTIONS.map((emotion) => (
                      <div className="emo-bar-row" key={emotion.key}>
                        <span className="emo-bar-label">{emotion.label}</span>
                        <div className="emo-bar-track">
                          <div className="emo-bar-fill" style={{ width: `${sliders[emotion.key]}%`, background: emotion.color }} />
                        </div>
                        <span className="emo-bar-pct">{sliders[emotion.key]}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="section-label">
                    <span className="section-label-text">Top 5 Hybrid Matches</span>
                    <div className="section-label-line" />
                  </div>
                  <div className="recs-panel">
                    {recommendations.map((anime, index) => {
                      const desc = anime.vibe || generateVibeDesc(Object.fromEntries(EMOTIONS.map((emotion) => [emotion.key, anime[emotion.key]])))
                      return (
                        <div key={`${anime.anime_name}-${anime.episode_name || index}`} className={`rec-item ${index === 0 ? 'top-rec-highlight' : ''}`}>
                          <div className={`rec-rank ${index === 0 ? 'top' : ''}`}>{index + 1}</div>
                          <div>
                            <div className="rec-name">{anime.anime_name}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{anime.episode_name}</div>
                            <div className="rec-desc">"{desc}"</div>
                            <div className="rec-badges">
                              <span className="badge">alpha·tab={anime.tabular.toFixed(3)}</span>
                              <span className="badge">sem={anime.semantic.toFixed(3)}</span>
                            </div>
                          </div>
                          <div className="rec-score-block">
                            <div className="rec-score">{anime.final.toFixed(4)}</div>
                            <div className="rec-bar">
                              <div className="rec-bar-fill" style={{ width: `${Math.round(anime.final * 100)}%` }} />
                            </div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>hybrid score</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="tab-script" className={`script-panel ${activeTab === 'script' ? 'active' : ''}`}>
          <div className="main-layout">
            <div>
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-icon" style={{ background: 'rgba(52,211,153,0.1)' }}>📄</div>
                  <div className="panel-title">Script Upload</div>
                </div>
                <div className="panel-body">
                  <div
                    className="upload-zone"
                    onClick={() => document.getElementById('file-input')?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <div className="upload-icon">📁</div>
                    <div className="upload-title">Drop subtitle file here</div>
                    <div className="upload-sub">Supports .srt, .txt — max 100 lines analyzed</div>
                  </div>
                  <input type="file" id="file-input" accept=".srt,.txt" onChange={handleFileUpload} hidden />


                  <div id="file-info" style={{ display: analysisReady ? 'block' : 'none', padding: 12, background: 'var(--surface2)', borderRadius: 8, marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fileName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{fileLines} dialogue lines detected</div>
                  </div>
                  {analysisError ? (
                    <div style={{ marginBottom: 12, padding: 12, borderRadius: 12, background: 'rgba(248, 113, 113, 0.12)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#fca5a5', fontSize: 13 }}>
                      {analysisError}
                    </div>
                  ) : null}

                  <button className="run-btn" onClick={runScriptAnalysis} disabled={!analysisReady} style={{ opacity: analysisReady ? 1 : 0.4 }}>
                    &#9654; Analyze Script
                  </button>

                  <div className="arch-tags">
                    <span className="arch-tag">DistilRoBERTa</span>
                    <span className="arch-tag">7-class</span>
                    <span className="arch-tag">softmax</span>
                    <span className="arch-tag">mean-pool</span>
                  </div>
                </div>
              </div>
            </div>

            <div id="script-results-area">
              <div id="script-placeholder" style={{ display: !analysisReady || (!analysisRunning && scriptSummary === '—') ? 'flex' : 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--surface2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, opacity: 0.4 }}>📊</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>Upload a Script</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>DistilRoBERTa will extract the emotional fingerprint</div>
                </div>
              </div>

              <div id="script-results" style={{ display: scriptSummary !== '—' ? 'block' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div className="section-label" style={{ marginBottom: 0, flex: 1 }}>
                    <span className="section-label-text">Emotional Fingerprint</span>
                    <div className="section-label-line" />
                  </div>
                  {scriptSource && (
                    <span style={{
                      fontSize: 11, padding: '3px 8px', borderRadius: 99, whiteSpace: 'nowrap', marginLeft: 12,
                      fontFamily: "'DM Mono', monospace",
                      background: scriptSource === 'local' ? 'rgba(251,146,60,0.12)' : 'rgba(192,132,252,0.12)',
                      color: scriptSource === 'local' ? '#fb923c' : '#c084fc',
                      border: `1px solid ${scriptSource === 'local' ? 'rgba(251,146,60,0.28)' : 'rgba(192,132,252,0.28)'}`,
                    }}>
                      {scriptSource === 'local' ? 'Local Lexicon' : 'DistilRoBERTa · HF'}
                    </span>
                  )}
                </div>

                <div id="script-processing" style={{ display: analysisRunning ? 'block' : 'none', padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>Analyzing emotion profile...</div>
                  <div className="loading-bar"><div className="loading-fill" /></div>
                  <div id="script-progress" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Analyzing up to 25 dialogue lines...</div>
                </div>

                <div className="analysis-results">
                  <div className="emo-grid">
                    {SCRIPT_EMOTIONS.map((emotion) => {
                      const pct = scriptResults[emotion.key] || 0
                      const maxPct = Math.max(...Object.values(scriptResults), 0.1)
                      return (
                        <div className="emo-cell" key={emotion.key}>
                          <div className="emo-cell-label">{emotion.label}</div>
                          <div className="emo-cell-pct" style={{ color: emotion.color }}>{pct.toFixed(1)}%</div>
                          <div className="emo-cell-bar">
                            <div className="emo-cell-fill" style={{ width: `${(pct / maxPct) * 100}%`, background: emotion.color }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="emotion-viz" style={{ marginTop: 16 }}>
                  <div className="section-label">
                    <span className="section-label-text">Score Distribution</span>
                    <div className="section-label-line" />
                  </div>
                  <div className="emotion-bars">
                    {[...SCRIPT_EMOTIONS].sort((a, b) => (scriptResults[b.key] || 0) - (scriptResults[a.key] || 0)).map((emotion) => (
                      <div className="emo-bar-row" key={emotion.key}>
                        <span className="emo-bar-label">{emotion.label}</span>
                        <div className="emo-bar-track">
                          <div className="emo-bar-fill" style={{ width: `${scriptResults[emotion.key] || 0}%`, background: emotion.color }} />
                        </div>
                        <span className="emo-bar-pct">{(scriptResults[emotion.key] || 0).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="vibe-card" style={{ marginTop: 16 }}>
                  <div className="vibe-title">Emotional Tone Summary</div>
                  <div className="vibe-text">{scriptSummary}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <div className="footer-text">AniEmo Hybrid System · Dissertation Research Edition · 9D XGBoost + MiniLM-L6 + DistilRoBERTa</div>
          <div className="footer-links">
            <a className="footer-link" href="#">Architecture</a>
            <a className="footer-link" href="#">Dataset</a>
            <a className="footer-link" href="#">Methodology</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
