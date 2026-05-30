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

const ANIME_DB = animeDataset

const initialSliders = EMOTIONS.reduce((acc, emotion) => {
  acc[emotion.key] = emotion.default
  return acc
}, {})

export default function Home() {
  const [sliders, setSliders] = useState(initialSliders)
  const [alpha, setAlpha] = useState(0.7)
  const [anchors, setAnchors] = useState({ ti: 0, eb: 0, pi: 0 })
  const [showResults, setShowResults] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [vibeText, setVibeText] = useState('—')

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

        <div id="tab-recommend" className="rec-panel-content">
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
