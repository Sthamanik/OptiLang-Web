import { Award, TrendingDown } from 'lucide-react'
import type { ScoreReport, Suggestion } from '@/types'

interface Props {
  score: ScoreReport | null
  suggestions: Suggestion[]
}

const gradeColor: Record<string, string> = {
  Excellent: '#3dd0a5',
  Good:      '#82aaff',
  Fair:      '#ffcb6b',
  Poor:      '#ef9f27',
  Critical:  '#e24b4a',
}

const severityMeta = {
  high:   { label: 'High',   cls: 'sev-high'   },
  medium: { label: 'Medium', cls: 'sev-medium' },
  low:    { label: 'Low',    cls: 'sev-low'    },
}

export default function ScorePanel({ score, suggestions }: Props) {
  if (!score) {
    return (
      <div className="placeholder">
        <Award size={18} />
        <span>Run code to see your optimization score</span>
      </div>
    )
  }

  const color = gradeColor[score.grade] ?? '#8b949e'
  const circumference = 2 * Math.PI * 44
  const offset = circumference * (1 - score.score / 100)

  const sorted = [...suggestions].sort(
    (a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]),
  )

  return (
    <div className="panel-body score-body">

      {/* Score ring */}
      <div className="score-ring-wrap">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="44" fill="none" stroke="#21262d" strokeWidth="10" />
          <circle
            cx="55" cy="55" r="44"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 55 55)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="score-ring-center">
          <span className="score-number">{Math.round(score.score)}</span>
          <span className="score-grade" style={{ color }}>{score.grade}</span>
        </div>
      </div>

      {/* Complexity */}
      <div className="complexity-badge">
        Complexity: <strong>{score.complexity_class}</strong>
      </div>

      {/* Breakdown */}
      <p className="section-label">Score breakdown</p>
      <div className="breakdown-list">
        {Object.entries(score.breakdown).map(([key, val]) => {
          const label = key.replace('_penalty', '').replace(/_/g, ' ')
          const pct = Math.min((val / 30) * 100, 100)
          return (
            <div key={key} className="breakdown-row">
              <span className="breakdown-label">{label}</span>
              <div className="breakdown-bar-track">
                <div
                  className="breakdown-bar-fill"
                  style={{ width: `${pct}%`, background: val > 15 ? '#e24b4a' : val > 5 ? '#ef9f27' : '#1d9e75' }}
                />
              </div>
              <span className="breakdown-val">-{val.toFixed(1)}</span>
            </div>
          )
        })}
      </div>

      {/* Suggestions */}
      {sorted.length > 0 && (
        <>
          <p className="section-label" style={{ marginTop: 20 }}>
            <TrendingDown size={13} style={{ marginRight: 4 }} />
            Optimization suggestions ({sorted.length})
          </p>
          <div className="suggestion-list">
            {sorted.map((s, i) => {
              const meta = severityMeta[s.severity]
              return (
                <div key={i} className={`suggestion-card ${meta.cls}`}>
                  <div className="suggestion-header">
                    <span className={`sev-badge ${meta.cls}`}>{meta.label}</span>
                    <span className="suggestion-line">Line {s.line}</span>
                    <span className="suggestion-pattern">{s.pattern}</span>
                  </div>
                  <p className="suggestion-desc">{s.description}</p>
                  <p className="suggestion-fix">💡 {s.suggestion}</p>
                </div>
              )
            })}
          </div>
        </>
      )}

      {sorted.length === 0 && (
        <div className="clean-code">
          ✅ No optimization issues found — great code!
        </div>
      )}
    </div>
  )
}
