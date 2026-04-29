import { useCallback, useEffect, useState } from 'react'
import { Play, Loader2, Zap, History, Keyboard, Download, WrapText, PanelLeft } from 'lucide-react'
import CodeEditor from '@/components/CodeEditor'
import EditorTabs from '@/components/EditorTabs'
import OutputPanel from '@/components/OutputPanel'
import ProfilingPanel from '@/components/ProfilingPanel'
import ScorePanel from '@/components/ScorePanel'
import type { ScoreReport } from '@/types'
import HistoryPanel from '@/components/HistoryPanel'
import NameModal from '@/components/NameModal'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import ExportReport from '@/components/ExportReport'
import AuthModal from '@/components/AuthModal'
import { executeCode } from '@/services/api'
import { useStore, applyTheme, type HistoryEntry, GUEST_MAX_RUNS, GUEST_FULL_RESULTS } from '@/store/useStore'
import { formatCode } from '@/utils/formatter'
import './App.css'

type ResultTab = 'output' | 'profiling' | 'score'

export default function App() {
  const {
    tabs, activeTabId, activeCode, updateTabCode,
    markTabNamed,
    nextTab, prevTab, switchTabByIndex,
    sidebarOpen, toggleSidebar,
    enableProfiling, setEnableProfiling,
    timeout,
    theme, setTheme,
    isRunning, setIsRunning,
    lastRunName, setLastRunName,
    output, errors, executionTimeMs,
    profiling, score, suggestions,
    activeTab, setActiveTab,
    apiError, setApiError,
    setResult, clearResult,
    historyOpen, toggleHistory,
    addToHistory,
    nameModalOpen, openNameModal, closeNameModal,
    shortcutsOpen, openShortcuts, closeShortcuts,
    exportOpen, openExport, closeExport,
    // Auth
    user, guestRunCount,
    authModalOpen, authModalTab,
    openAuthModal, closeAuthModal,
    guestFullResults,
    logout,
  } = useStore()

  const code = activeCode()
  const activeTabObj = tabs.find(t => t.id === activeTabId)
  const hasErrors = errors.length > 0

  // ── Run button feedback state ─────────────────────────────────────────────
  // 'idle' | 'running' | 'success' | 'error'
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')

  // ── true when guest is in their first 3 runs (full results allowed) ───────
  const showFullResults = guestFullResults()

  // Cast score to ScoreReport so TypeScript is happy with both panels
  const typedScore = score as ScoreReport | null

  useEffect(() => { applyTheme(theme) }, [])

  // ── Run code ──────────────────────────────────────────────────────────────
  const runCode = useCallback(async (runName: string) => {
    const state = useStore.getState()
    const currentCode = state.activeCode()
    const currentTabId = state.activeTabId

    // Guest limit — block if 5 runs used
    if (!state.canRun()) {
      state.openAuthModal('signup')
      return
    }

    setLastRunName(runName)
    setIsRunning(true)
    setRunStatus('running')
    clearResult()
    setActiveTab('output')

    // Mark tab as named so subsequent runs skip the modal
    markTabNamed(currentTabId, runName)

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

      // Flash success or error on the run button
      if (d.errors.length > 0) {
        setRunStatus('error')
      } else {
        setRunStatus('success')
      }
      setTimeout(() => setRunStatus('idle'), 1500)

      // Count guest run ONLY if no errors — errored runs don't consume the limit
      if (!useStore.getState().user && d.errors.length === 0) {
        useStore.getState().incrementGuestRun()
      }

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

    } catch (err: any) {
      setRunStatus('error')
      setTimeout(() => setRunStatus('idle'), 1500)
      setApiError(
        err?.response?.data?.detail ||
        err?.message ||
        'Cannot reach the server. Is server.py running?'
      )
    } finally {
      setIsRunning(false)
    }
  }, [
    enableProfiling, timeout,
    setIsRunning, setLastRunName, clearResult,
    setResult, setApiError, setActiveTab,
    addToHistory, markTabNamed,
  ])

  // ── Smart run — first run asks for name, subsequent runs silent ───────────
  const handleRunClick = useCallback(() => {
    if (isRunning || !code.trim()) return

    const state = useStore.getState()
    if (!state.canRun()) {
      state.openAuthModal('signup')
      return
    }

    const tab = state.tabs.find(t => t.id === state.activeTabId)
    if (tab?.hasBeenNamed && tab.runName) {
      runCode(tab.runName)
    } else {
      openNameModal()
    }
  }, [isRunning, code, runCode, openNameModal])

  const handleFormat = useCallback(() => {
    updateTabCode(activeTabId, formatCode(useStore.getState().activeCode()))
  }, [activeTabId, updateTabCode])

  // ── Global keyboard shortcuts ─────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      if (ctrl && e.key === 'Enter') { e.preventDefault(); handleRunClick() }
      if (e.altKey && shift && e.key === 'F') { e.preventDefault(); handleFormat() }
      if (ctrl && !shift && e.key === 'Tab') { e.preventDefault(); nextTab() }
      if (ctrl && shift && e.key === 'Tab') { e.preventDefault(); prevTab() }
      if (ctrl && e.key >= '1' && e.key <= '9') { e.preventDefault(); switchTabByIndex(parseInt(e.key) - 1) }
      if (ctrl && e.key === 't') { e.preventDefault(); useStore.getState().addTab() }
      if (ctrl && e.key === 'w') { e.preventDefault(); useStore.getState().closeTab(activeTabId) }
      if (ctrl && e.key === 'b') { e.preventDefault(); toggleSidebar() }
      if (ctrl && e.key === 'h') { e.preventDefault(); toggleHistory() }
      if (ctrl && e.key === 'k') { e.preventDefault(); shortcutsOpen ? closeShortcuts() : openShortcuts() }
      if (ctrl && e.key === 'e') { e.preventDefault(); if (!hasErrors) { exportOpen ? closeExport() : openExport() } }
      if (e.key === 'Escape') { closeShortcuts(); closeExport(); closeNameModal(); closeAuthModal() }
    },
    [
      handleRunClick, handleFormat,
      nextTab, prevTab, switchTabByIndex, activeTabId,
      toggleSidebar, toggleHistory,
      shortcutsOpen, openShortcuts, closeShortcuts,
      exportOpen, openExport, closeExport,
      closeNameModal, closeAuthModal, hasErrors,
    ],
  )

  // ── Result tabs — hide profiling+score on errors OR guest past limit ──────
  const resultTabs: { id: ResultTab; label: string; count?: number; disabled?: boolean; hidden?: boolean }[] = [
    { id: 'output', label: 'Output', count: errors.length || undefined },
    { id: 'profiling', label: 'Profiling', disabled: !profiling, hidden: hasErrors || !showFullResults },
    { id: 'score', label: 'Score', disabled: !score, hidden: hasErrors || !showFullResults },
  ]

  return (
    <div className="app" onKeyDown={handleKeyDown} tabIndex={-1}>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <NameModal
        isOpen={nameModalOpen}
        onConfirm={(name) => { closeNameModal(); runCode(name) }}
        onCancel={closeNameModal}
      />
      <KeyboardShortcuts isOpen={shortcutsOpen} onClose={closeShortcuts} />
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        defaultTab={authModalTab}
      />
      <ExportReport
        isOpen={exportOpen} onClose={closeExport}
        runName={lastRunName} code={code}
        output={output} errors={errors}
        executionTimeMs={executionTimeMs}
        profiling={profiling} score={score} suggestions={suggestions}
      />

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
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
              onChange={e => setEnableProfiling(e.target.checked)}
            />
            Profiling
          </label>

          <ThemeSwitcher current={theme} onChange={setTheme} />

          {/* ── User pill or guest run meter ─────────────────────────── */}
          {user ? (
            <div className="user-pill">
              <span className="user-avatar">{user.name[0].toUpperCase()}</span>
              <span className="user-name">{user.name.split(' ')[0]}</span>
              <button className="user-logout" onClick={logout} title="Sign out">✕</button>
            </div>
          ) : (
            <div className="guest-meter" title={`Guest: ${guestRunCount}/${GUEST_MAX_RUNS} runs used`}>
              <div className="guest-pips">
                {Array.from({ length: GUEST_MAX_RUNS }).map((_, i) => (
                  <span
                    key={i}
                    className={[
                      'guest-pip',
                      i < guestRunCount ? 'guest-pip-used' : '',
                      i < GUEST_FULL_RESULTS ? 'guest-pip-full' : 'guest-pip-limited',
                    ].join(' ')}
                    title={i < GUEST_FULL_RESULTS ? 'Full results' : 'Output only'}
                  />
                ))}
              </div>
              <button className="guest-login-btn" onClick={() => openAuthModal('login')}>
                Sign in
              </button>
            </div>
          )}

          {/* History only for logged-in users */}
          {user && (
            <button
              className={`icon-btn ${historyOpen ? 'icon-btn-active' : ''}`}
              onClick={toggleHistory}
              title="Run history (Ctrl+H)"
            >
              <History size={16} />
            </button>
          )}

          <button className="icon-btn" onClick={handleFormat} title="Format code (Alt+Shift+F)">
            <WrapText size={16} />
          </button>

          <button
            className={`icon-btn ${exportOpen ? 'icon-btn-active' : ''} ${hasErrors ? 'icon-btn-disabled' : ''}`}
            onClick={hasErrors ? undefined : openExport}
            title={hasErrors ? 'Fix errors before exporting' : 'Export report (Ctrl+E)'}
            disabled={hasErrors}
          >
            <Download size={16} />
          </button>

          <button
            className={`icon-btn ${shortcutsOpen ? 'icon-btn-active' : ''}`}
            onClick={openShortcuts}
            title="Shortcuts (Ctrl+K)"
          >
            <Keyboard size={16} />
          </button>

          <button
            className={`run-btn run-btn-${runStatus}`}
            onClick={handleRunClick}
            disabled={isRunning}
            title={
              activeTabObj?.hasBeenNamed
                ? `Run as "${activeTabObj.runName}" (Ctrl+Enter)`
                : 'Run — will ask for name (Ctrl+Enter)'
            }
          >
            {runStatus === 'running' && <><Loader2 size={14} className="spin" /> Running…</>}
            {runStatus === 'success' && <><span className="run-flash">✓</span> Done!</>}
            {runStatus === 'error' && <><span className="run-flash">✗</span> Error</>}
            {runStatus === 'idle' && <><Play size={14} /> Run</>}
          </button>
        </div>
      </header>

      {apiError && (
        <div className="error-banner">
          ⚠ {apiError}
          <button onClick={() => setApiError(null)}>✕</button>
        </div>
      )}

      {/* ── Guest restriction notice ─────────────────────────────────── */}
      {!user && !showFullResults && (profiling || score) && !hasErrors && (
        <div className="guest-notice">
          <span>🔒 Sign in to view Profiling &amp; Score results</span>
          <button onClick={() => openAuthModal('signup')}>Create free account →</button>
        </div>
      )}

      {/* ── Guest exhausted notice ───────────────────────────────────── */}
      {!user && guestRunCount >= GUEST_MAX_RUNS && (
        <div className="guest-notice guest-notice-warn">
          <span>⚠ Guest limit reached ({GUEST_MAX_RUNS} runs used). Sign up to continue.</span>
          <button onClick={() => openAuthModal('signup')}>Sign up free →</button>
        </div>
      )}

      <main className="main">

        {/* Activity bar — only for logged-in users */}
        {user && (
          <div className="activity-bar">
            <button
              className={`activity-btn ${sidebarOpen ? 'activity-btn-active' : ''}`}
              onClick={toggleSidebar}
              title="Toggle editor panel (Ctrl+B)"
            >
              <PanelLeft size={16} />
            </button>
          </div>
        )}

        {/* History panel — only for logged-in users */}
        {user && <HistoryPanel />}

        {/* Editor — Open Editors sidebar only for logged-in users */}
        <section className={`editor-pane ${!user ? 'no-sidebar' : ''}`}>
          {user && <EditorTabs />}
          <div className="editor-wrap">
            <CodeEditor
              value={code}
              onChange={v => updateTabCode(activeTabId, v)}
              lineStats={profiling?.line_stats ?? {}}
              suggestions={suggestions}
              errors={errors}
            />
          </div>
        </section>

        {/* Results */}
        <section className="results-pane">
          <div className="tab-bar">
            {resultTabs.filter(t => !t.hidden).map(t => (
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
            {activeTab === 'profiling' && <ProfilingPanel profiling={profiling} score={typedScore} />}
            {activeTab === 'score' && <ScorePanel score={typedScore} suggestions={suggestions} />}
          </div>
        </section>

      </main>
    </div>
  )
}
