import { useEffect, useRef } from 'react'
import { Award, TrendingDown, BarChart2 } from 'lucide-react'
import type { Suggestion } from '@/types'

export interface DimensionScores {
  correctness: number
  efficiency_complexity: number
  quality: number
  maintainability: number
  complexity_subscore: number
  efficiency_subscore: number
  profiling_partial: boolean
  optimizer_partial: boolean
}

export interface ScoreReport {
  score: number
  grade: string
  complexity_class: string
  dimensions: DimensionScores
  narrative: string
  error_count: number
  lines_profiled: number
  cv: number
}

interface Props {
  score: ScoreReport | null
  suggestions: Suggestion[]
}

const gradeColor: Record<string, string> = {
  Excellent: '#9461ff',
  Good: '#a78bfa',
  Fair: '#ffcb6b',
  Poor: '#ef9f27',
  Critical: '#e24b4a',
}

const severityMeta = {
  high: { label: 'High', cls: 'sev-high' },
  medium: { label: 'Medium', cls: 'sev-medium' },
  low: { label: 'Low', cls: 'sev-low' },
}

const DIMENSIONS = [
  { key: 'correctness', label: 'Correctness', max: 35 },
  { key: 'efficiency_complexity', label: 'Efficiency & Cmplx', max: 30 },
  { key: 'quality', label: 'Quality', max: 20 },
  { key: 'maintainability', label: 'Maintainability', max: 15 },
]

// ── Animated score ring ───────────────────────────────────────────────────────
function ScoreRing({ score, color, grade }: { score: number; color: string; grade: string }) {
  const circumference = 2 * Math.PI * 44
  const targetOffset = circumference * (1 - score / 100)
  const circleRef = useRef<SVGCircleElement>(null)
  const glowRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const el = circleRef.current
    const glow = glowRef.current
    if (!el) return

    el.style.strokeDashoffset = String(circumference)
    el.style.transition = 'none'
    if (glow) {
      glow.style.strokeDashoffset = String(circumference)
      glow.style.transition = 'none'
    }
    void el.getBoundingClientRect()

    requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)'
      el.style.strokeDashoffset = String(targetOffset)
      if (glow) {
        glow.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)'
        glow.style.strokeDashoffset = String(targetOffset)
      }
    })
  }, [score, targetOffset, circumference])

  return (
    <div className="score-ring-wrap">
      <svg width="120" height="120" viewBox="0 0 110 110">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="55" cy="55" r="44" fill="none" stroke="#21262d" strokeWidth="9" />
        <circle
          ref={glowRef}
          cx="55" cy="55" r="44"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform="rotate(-90 55 55)"
          opacity="0.3"
          filter="url(#glow)"
        />
        <circle
          ref={circleRef}
          cx="55" cy="55" r="44"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform="rotate(-90 55 55)"
        />
      </svg>
      <div className="score-ring-center">
        <span className="score-number">{Math.round(score)}</span>
        <span className="score-grade" style={{ color }}>{grade}</span>
      </div>
    </div>
  )
}

// ── Animated breakdown bar ────────────────────────────────────────────────────
function BreakdownRow({ label, pct, val, max }: {
  label: string; pct: number; val: number; max: number
}) {
  const fillRef = useRef<HTMLDivElement>(null)

  const barColor = pct >= 75
    ? 'linear-gradient(90deg, #1d9e75, #3dd0a5)'
    : pct >= 45
      ? 'linear-gradient(90deg, #ef9f27, #ffcb6b)'
      : 'linear-gradient(90deg, #e24b4a, #ff6b6b)'

  useEffect(() => {
    const el = fillRef.current
    if (!el) return
    el.style.width = '0%'
    el.style.transition = 'none'
    void el.getBoundingClientRect()
    requestAnimationFrame(() => {
      el.style.transition = 'width 1.1s cubic-bezier(0.4, 0, 0.2, 1)'
      el.style.width = `${pct}%`
    })
  }, [pct])

  return (
    <div className="breakdown-row">
      <span className="breakdown-label">{label}</span>
      <div className="breakdown-bar-track">
        <div
          ref={fillRef}
          className="breakdown-bar-fill"
          style={{ width: '0%', background: barColor }}
        />
      </div>
      <span className="breakdown-val">{val.toFixed(1)}/{max}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ScorePanel({ score, suggestions }: Props) {
  if (!score) {
    return (
      <div className="placeholder">
        <Award size={18} />
        <span>Run code to see your optimization score</span>
      </div>
    )
  }

  const color = gradeColor[score.grade] ?? '#9461ff'

  const sorted = [...suggestions].sort(
    (a, b) =>
      ({ high: 0, medium: 1, low: 2 }[a.severity] ?? 2) -
      ({ high: 0, medium: 1, low: 2 }[b.severity] ?? 2),
  )

  return (
    <div className="panel-body score-body">

      {/* Ring */}
      <ScoreRing score={score.score} color={color} grade={score.grade} />

      {/* Complexity */}
      <div className="complexity-badge">
        Complexity: <strong>{score.complexity_class}</strong>
      </div>

      {/* Narrative */}
      {score.narrative && (
        <p className="score-narrative">{score.narrative}</p>
      )}

      {/* Breakdown */}
      <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <BarChart2 size={12} /> Score breakdown
      </p>
      <div className="breakdown-list">
        {DIMENSIONS.map(({ key, label, max }) => {
          const val = (score.dimensions[key as keyof DimensionScores] as number) ?? 0
          const pct = Math.min((val / max) * 100, 100)
          return <BreakdownRow key={key} label={label} pct={pct} val={val} max={max} />
        })}
      </div>

      {/* Partial credit warning */}
      {(score.dimensions.profiling_partial || score.dimensions.optimizer_partial) && (
        <div className="partial-note">
          ⚠ Partial credit applied —{' '}
          {score.dimensions.profiling_partial && 'profiling unavailable. '}
          {score.dimensions.optimizer_partial && 'optimizer unavailable.'}
        </div>
      )}

      {/* Suggestions */}
      {sorted.length > 0 ? (
        <>
          <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <TrendingDown size={12} />
            Optimization suggestions ({sorted.length})
          </p>
          <div className="suggestion-list">
            {sorted.map((s, i) => {
              const meta = severityMeta[s.severity as keyof typeof severityMeta]
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
      ) : (
        <div className="clean-code">✅ No optimization issues found — great code!</div>
      )}

    </div>
  )
}