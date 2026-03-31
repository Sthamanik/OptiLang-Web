import { Terminal, AlertCircle } from 'lucide-react'

interface Props {
  output: string
  errors: string[]
  executionTimeMs: number | null
  isRunning: boolean
}

export default function OutputPanel({ output, errors, executionTimeMs, isRunning }: Props) {
  const hasOutput = output.trim().length > 0
  const hasErrors = errors.length > 0

  return (
    <div className="panel-body">
      {isRunning && (
        <div className="placeholder">
          <span className="spinner" /> Executing…
        </div>
      )}

      {!isRunning && !hasOutput && !hasErrors && (
        <div className="placeholder">
          <Terminal size={18} />
          <span>Press <kbd>Run</kbd> to execute your PyLite code</span>
        </div>
      )}

      {hasOutput && (
        <pre className="output-text">{output}</pre>
      )}

      {hasErrors && (
        <div className="error-list">
          {errors.map((err, i) => (
            <div key={i} className="error-item">
              <AlertCircle size={14} className="error-icon" />
              <span className="error-msg">{err}</span>
            </div>
          ))}
        </div>
      )}

      {executionTimeMs !== null && !isRunning && (
        <div className="exec-footer">
          Finished in <strong>{executionTimeMs.toFixed(2)} ms</strong>
        </div>
      )}
    </div>
  )
}
