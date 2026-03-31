import { useCallback } from 'react'
import { Play, Loader2, Zap, History } from 'lucide-react'
import CodeEditor from '@/components/CodeEditor'
import EditorTabs from '@/components/EditorTabs'
import OutputPanel from '@/components/OutputPanel'
import ProfilingPanel from '@/components/ProfilingPanel'
import ScorePanel from '@/components/ScorePanel'
import HistoryPanel from '@/components/HistoryPanel'
import NameModal from '@/components/NameModal'
import { executeCode } from '@/services/api'
import { useStore, type HistoryEntry } from '@/store/useStore'
import './App.css'

type Tab = 'output' | 'profiling' | 'score'

export default function App() {
  const {
    activeTabId, activeCode, updateTabCode,
    enableProfiling, setEnableProfiling,
    timeout,
    isRunning, setIsRunning,
    output, errors, executionTimeMs,
    profiling, score, suggestions,
    activeTab, setActiveTab,
    apiError, setApiError,
    setResult, clearResult,
    historyOpen, toggleHistory,
    addToHistory,
    nameModalOpen, openNameModal, closeNameModal,
  } = useStore()

  const code = activeCode()

  const runCode = useCallback(async (runName: string) => {
    const currentCode = useStore.getState().activeCode()
    setIsRunning(true)
    clearResult()
    setActiveTab('output')

    try {
      const res = await executeCode({
        code: currentCode,
        enable_profiling: enableProfiling,
        timeout,
      })

      if (!res.success || !res.data) {
        setApiError(res.message || 'Execution failed')
        return
      }

      const d = res.data
      setResult(d)

      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: runName,
        code: currentCode,
        output: d.output,
        errors: d.errors,
        executionTimeMs: d.execution_time_ms,
        score: d.score?.score ?? null,
        grade: d.score?.grade ?? null,
        complexity: d.score?.complexity_class ?? null,
        timestamp: new Date().toISOString(),
      }
      addToHistory(entry)

      if (d.profiling && Object.keys(d.profiling.line_stats).length > 0) {
        setActiveTab('profiling')
      }
    } catch (err: any) {
      setApiError(
        err?.response?.data?.detail ||
        err?.message ||
        'Cannot reach the server. Is server.py running?'
      )
    } finally {
      setIsRunning(false)
    }
  }, [enableProfiling, timeout, setIsRunning, clearResult,
    setResult, setApiError, setActiveTab, addToHistory])

  const handleRunClick = useCallback(() => {
    if (isRunning || !code.trim()) return
    openNameModal()
  }, [isRunning, code, openNameModal])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRunClick()
      }
    },
    [handleRunClick],
  )

  const resultTabs: { id: Tab; label: string; count?: number; disabled?: boolean }[] = [
    { id: 'output', label: 'Output', count: errors.length || undefined },
    { id: 'profiling', label: 'Profiling', disabled: !profiling },
    { id: 'score', label: 'Score', disabled: !score },
  ]

  return (
    <div className="app" onKeyDown={handleKeyDown} tabIndex={-1}>

      <NameModal
        isOpen={nameModalOpen}
        onConfirm={(name: string) => { closeNameModal(); runCode(name) }}
        onCancel={closeNameModal}
      />

      {/* Topbar */}
      <header className="topbar">
        <div className="brand">
          <Zap size={18} className="brand-icon" />
          <span className="brand-name">OptiLang</span>
          <span className="brand-tag">PyLite</span>
        </div>

        <div className="toolbar">
          <label className="toggle">
            <input
              type="checkbox"
              checked={enableProfiling}
              onChange={(e) => setEnableProfiling(e.target.checked)}
            />
            Profiling
          </label>

          <button
            className={`icon-btn ${historyOpen ? 'icon-btn-active' : ''}`}
            onClick={toggleHistory}
            title="Toggle run history"
          >
            <History size={16} />
          </button>

          <button
            className={`run-btn ${isRunning ? 'running' : ''}`}
            onClick={handleRunClick}
            disabled={isRunning}
            title="Run (Ctrl+Enter)"
          >
            {isRunning
              ? <><Loader2 size={14} className="spin" /> Running…</>
              : <><Play size={14} /> Run</>
            }
          </button>
        </div>
      </header>

      {apiError && (
        <div className="error-banner">
          ⚠ {apiError}
          <button onClick={() => setApiError(null)}>✕</button>
        </div>
      )}

      <main className="main">

        <HistoryPanel />

        {/* Editor — tab bar ON TOP, Monaco below */}
        <section className="editor-pane">
          <EditorTabs />
          <div className="editor-wrap">
            <CodeEditor
              value={code}
              onChange={(v: unknown) => updateTabCode(activeTabId, v)}
              lineStats={profiling?.line_stats ?? {}}
              suggestions={suggestions}
              errors={errors}
            />
          </div>
        </section>

        {/* Results */}
        <section className="results-pane">
          <div className="tab-bar">
            {resultTabs.map((t) => (
              <button
                key={t.id}
                className={`tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
                disabled={t.disabled}
              >
                {t.label}
                {t.count != null && t.count > 0 && (
                  <span className="badge badge-err">{t.count}</span>
                )}
              </button>
            ))}
            {executionTimeMs !== null && (
              <span className="exec-time">{executionTimeMs.toFixed(1)} ms</span>
            )}
          </div>

          <div className="tab-content">
            {activeTab === 'output' && <OutputPanel output={output} errors={errors} executionTimeMs={executionTimeMs} isRunning={isRunning} />}
            {activeTab === 'profiling' && <ProfilingPanel profiling={profiling} />}
            {activeTab === 'score' && <ScorePanel score={score} suggestions={suggestions} />}
          </div>
        </section>

      </main>
    </div>
  )
}
