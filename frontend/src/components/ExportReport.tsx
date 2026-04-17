import { Download, FileText, FileJson, X } from 'lucide-react'
import type { ProfilingData, ScoreReport, Suggestion } from '@/types'

interface Props {
  isOpen:          boolean
  onClose:         () => void
  runName:         string
  code:            string
  output:          string
  errors:          string[]
  executionTimeMs: number | null
  profiling:       ProfilingData | null
  score:           ScoreReport | null
  suggestions:     Suggestion[]
}

// ── Text report ───────────────────────────────────────────────────────────────
function buildTextReport(props: Omit<Props, 'isOpen' | 'onClose'>): string {
  const {
    runName, code, output, errors,
    executionTimeMs, profiling, score, suggestions,
  } = props

  const line = '─'.repeat(50)
  const now  = new Date().toLocaleString()

  let report = `
OptiLang Execution Report
${line}
Name        : ${runName || 'Untitled'}
Date        : ${now}
${line}

SCORE
${line}
Score       : ${score ? `${score.score}/100` : 'N/A'}
Grade       : ${score?.grade ?? 'N/A'}
Complexity  : ${score?.complexity_class ?? profiling?.complexity_estimate ?? 'N/A'}
Time        : ${executionTimeMs != null ? `${executionTimeMs.toFixed(2)} ms` : 'N/A'}
${score ? `
Breakdown:
  Severity penalty    : -${score.breakdown.severity_penalty.toFixed(2)}
  Complexity penalty  : -${score.breakdown.complexity_penalty.toFixed(2)}
  Performance penalty : -${score.breakdown.performance_penalty.toFixed(2)}
  Memory penalty      : -${score.breakdown.memory_penalty.toFixed(2)}` : ''}

PROFILING
${line}
${profiling ? `
Total time      : ${profiling.total_time_ms.toFixed(3)} ms
Lines executed  : ${profiling.total_lines_executed}
Peak memory     : ${(profiling.peak_memory_bytes / 1024).toFixed(2)} KB
Complexity      : ${profiling.complexity_estimate}

Hottest lines:
${Object.values(profiling.line_stats)
    .sort((a, b) => b.avg_time_ms - a.avg_time_ms)
    .slice(0, 5)
    .map(s => `  Line ${s.line.toString().padEnd(4)} | ${s.count}× | avg ${s.avg_time_ms.toFixed(3)} ms | total ${s.total_time_ms.toFixed(3)} ms`)
    .join('\n')}

Function calls:
${Object.values(profiling.function_stats).length > 0
    ? Object.values(profiling.function_stats)
        .map(f => `  ${f.name}() | ${f.calls} calls | avg ${f.avg_time_ms.toFixed(3)} ms`)
        .join('\n')
    : '  None'
}` : '  No profiling data'}

OUTPUT
${line}
${output || '(no output)'}

${errors.length > 0 ? `ERRORS\n${line}\n${errors.join('\n')}\n` : ''}
OPTIMIZATION SUGGESTIONS
${line}
${suggestions.length > 0
    ? suggestions.map(s =>
        `  [${s.severity.toUpperCase()}] Line ${s.line} — ${s.description}\n  Fix: ${s.suggestion}`
      ).join('\n\n')
    : '  No suggestions — clean code!'}

SOURCE CODE
${line}
${code}
`.trim()

  return report
}

// ── JSON report ───────────────────────────────────────────────────────────────
function buildJsonReport(props: Omit<Props, 'isOpen' | 'onClose'>) {
  return {
    meta: {
      generated_by: 'OptiLang',
      name:         props.runName || 'Untitled',
      timestamp:    new Date().toISOString(),
    },
    score:       props.score,
    profiling:   props.profiling,
    suggestions: props.suggestions,
    execution: {
      time_ms: props.executionTimeMs,
      output:  props.output,
      errors:  props.errors,
    },
    source_code: props.code,
  }
}

// ── Download helper ───────────────────────────────────────────────────────────
function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ExportReport({ isOpen, onClose, ...rest }: Props) {
  if (!isOpen) return null

  const safeName = (rest.runName || 'optilang-report').replace(/[^a-z0-9]/gi, '-').toLowerCase()

  const handleText = () => {
    download(buildTextReport(rest), `${safeName}.txt`, 'text/plain')
    onClose()
  }

  const handleJson = () => {
    download(JSON.stringify(buildJsonReport(rest), null, 2), `${safeName}.json`, 'application/json')
    onClose()
  }

  const hasData = rest.profiling || rest.score || rest.output

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="export-modal" onClick={e => e.stopPropagation()}>

        <div className="export-header">
          <div className="export-title">
            <Download size={16} />
            <span>Export Report</span>
          </div>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        {!hasData ? (
          <div className="export-empty">
            Run your code first to generate a report.
          </div>
        ) : (
          <>
            <div className="export-preview">
              <div className="export-preview-row">
                <span className="export-label">Run name</span>
                <span className="export-value">{rest.runName || 'Untitled'}</span>
              </div>
              <div className="export-preview-row">
                <span className="export-label">Score</span>
                <span className="export-value">
                  {rest.score ? `${rest.score.score}/100 (${rest.score.grade})` : 'N/A'}
                </span>
              </div>
              <div className="export-preview-row">
                <span className="export-label">Complexity</span>
                <span className="export-value">
                  {rest.score?.complexity_class ?? rest.profiling?.complexity_estimate ?? 'N/A'}
                </span>
              </div>
              <div className="export-preview-row">
                <span className="export-label">Execution time</span>
                <span className="export-value">
                  {rest.executionTimeMs != null ? `${rest.executionTimeMs.toFixed(2)} ms` : 'N/A'}
                </span>
              </div>
              <div className="export-preview-row">
                <span className="export-label">Suggestions</span>
                <span className="export-value">{rest.suggestions.length}</span>
              </div>
            </div>

            <p className="export-sub">Choose export format:</p>

            <div className="export-btns">
              <button className="export-btn" onClick={handleText}>
                <FileText size={18} />
                <span className="export-btn-label">Text Report</span>
                <span className="export-btn-sub">.txt — human readable</span>
              </button>

              <button className="export-btn" onClick={handleJson}>
                <FileJson size={18} />
                <span className="export-btn-label">JSON Report</span>
                <span className="export-btn-sub">.json — full data</span>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
