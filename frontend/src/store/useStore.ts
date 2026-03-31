import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ExecutionResult, Suggestion, ProfilingData, ScoreReport } from '@/types'

// ── Tab ───────────────────────────────────────────────────────────────────────
export interface EditorTab {
  id:   string
  name: string   // e.g. "main.pylite"
  code: string
}

// ── History ───────────────────────────────────────────────────────────────────
export interface HistoryEntry {
  id:              string
  name:            string
  code:            string
  output:          string
  errors:          string[]
  executionTimeMs: number
  score:           number | null
  grade:           string | null
  complexity:      string | null
  timestamp:       string
}

// ── Store interface ───────────────────────────────────────────────────────────
interface EditorStore {
  // ── Tabs ──────────────────────────────────────────────────────────────────
  tabs:        EditorTab[]
  activeTabId: string
  activeCode:  () => string   // derived — code of active tab

  addTab:         ()                              => void
  closeTab:       (id: string)                    => void
  switchTab:      (id: string)                    => void
  renameTab:      (id: string, name: string)      => void
  updateTabCode:  (id: string, code: string)      => void

  // ── Settings ──────────────────────────────────────────────────────────────
  enableProfiling: boolean
  setEnableProfiling: (v: boolean) => void
  timeout: number
  setTimeout: (v: number) => void

  // ── Run state ─────────────────────────────────────────────────────────────
  isRunning: boolean
  setIsRunning: (v: boolean) => void

  // ── Name modal ────────────────────────────────────────────────────────────
  nameModalOpen: boolean
  openNameModal:  () => void
  closeNameModal: () => void

  // ── Results ───────────────────────────────────────────────────────────────
  output:          string
  errors:          string[]
  executionTimeMs: number | null
  profiling:       ProfilingData | null
  score:           ScoreReport  | null
  suggestions:     Suggestion[]
  setResult:   (result: ExecutionResult) => void
  clearResult: () => void

  // ── Tabs UI ───────────────────────────────────────────────────────────────
  activeTab: 'output' | 'profiling' | 'score'
  setActiveTab: (tab: EditorStore['activeTab']) => void

  // ── API error ─────────────────────────────────────────────────────────────
  apiError: string | null
  setApiError: (msg: string | null) => void

  // ── History sidebar ───────────────────────────────────────────────────────
  historyOpen:   boolean
  toggleHistory: () => void

  history:              HistoryEntry[]
  addToHistory:         (entry: HistoryEntry) => void
  deleteFromHistory:    (id: string)          => void
  renameHistoryEntry:   (id: string, name: string) => void
  clearHistory:         () => void
  loadFromHistory:      (entry: HistoryEntry) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────
let _tabCounter = 1
const newTab = (code = ''): EditorTab => ({
  id:   `tab-${Date.now()}-${_tabCounter++}`,
  name: `untitled-${_tabCounter - 1}.pylite`,
  code,
})

const SAMPLE_CODE = `# OptiLang — PyLite sample
# Press Ctrl+Enter or click Run

def fibonacci(n):
    if n <= 1:
        return n
    a = 0
    b = 1
    for i in range(2, n + 1):
        c = a + b
        a = b
        b = c
    return b

def is_prime(n):
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True

print("Fibonacci:")
for i in range(10):
    print(fibonacci(i))

print("")
print("Primes up to 30:")
for n in range(2, 31):
    if is_prime(n):
        print(n)
`

const initialTab: EditorTab = { id: 'tab-initial', name: 'main.pylite', code: SAMPLE_CODE }

// ── Store ─────────────────────────────────────────────────────────────────────
export const useStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      // ── Tabs ────────────────────────────────────────────────────────────────
      tabs:        [initialTab],
      activeTabId: initialTab.id,

      activeCode: () => {
        const { tabs, activeTabId } = get()
        return tabs.find(t => t.id === activeTabId)?.code ?? ''
      },

      addTab: () => {
        const tab = newTab()
        set(s => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }))
      },

      closeTab: (id) => {
        set(s => {
          if (s.tabs.length === 1) return s   // never close the last tab
          const idx     = s.tabs.findIndex(t => t.id === id)
          const newTabs = s.tabs.filter(t => t.id !== id)
          // if we closed the active tab, switch to neighbour
          const newActive =
            s.activeTabId === id
              ? (newTabs[Math.min(idx, newTabs.length - 1)]?.id ?? newTabs[0].id)
              : s.activeTabId
          return { tabs: newTabs, activeTabId: newActive }
        })
      },

      switchTab: (id) => set({ activeTabId: id }),

      renameTab: (id, name) =>
        set(s => ({
          tabs: s.tabs.map(t => t.id === id ? { ...t, name } : t),
        })),

      updateTabCode: (id, code) =>
        set(s => ({
          tabs: s.tabs.map(t => t.id === id ? { ...t, code } : t),
        })),

      // ── Settings ────────────────────────────────────────────────────────────
      enableProfiling: true,
      setEnableProfiling: (v) => set({ enableProfiling: v }),
      timeout: 10,
      setTimeout: (v) => set({ timeout: v }),

      isRunning: false,
      setIsRunning: (v) => set({ isRunning: v }),

      nameModalOpen: false,
      openNameModal:  () => set({ nameModalOpen: true }),
      closeNameModal: () => set({ nameModalOpen: false }),

      output: '', errors: [], executionTimeMs: null,
      profiling: null, score: null, suggestions: [],

      setResult: (r) => set({
        output:          r.output,
        errors:          r.errors,
        executionTimeMs: r.execution_time_ms,
        profiling:       r.profiling,
        score:           r.score,
        suggestions:     r.suggestions,
      }),

      clearResult: () => set({
        output: '', errors: [], executionTimeMs: null,
        profiling: null, score: null, suggestions: [], apiError: null,
      }),

      activeTab: 'output',
      setActiveTab: (tab) => set({ activeTab: tab }),

      apiError: null,
      setApiError: (msg) => set({ apiError: msg }),

      historyOpen: false,
      toggleHistory: () => set(s => ({ historyOpen: !s.historyOpen })),

      history: [],

      addToHistory: (entry) =>
        set(s => ({ history: [entry, ...s.history].slice(0, 50) })),

      deleteFromHistory: (id) =>
        set(s => ({ history: s.history.filter(e => e.id !== id) })),

      renameHistoryEntry: (id, name) =>
        set(s => ({
          history: s.history.map(e => e.id === id ? { ...e, name } : e),
        })),

      clearHistory: () => set({ history: [] }),

      // Load history entry into a NEW tab
      loadFromHistory: (entry) => {
        const tab = newTab(entry.code)
        tab.name  = `${entry.name}.pylite`
        set(s => ({
          tabs:        [...s.tabs, tab],
          activeTabId: tab.id,
          historyOpen: false,
        }))
      },
    }),
    {
      name: 'optilang-storage',
      partialize: (s) => ({
        history:         s.history,
        tabs:            s.tabs,
        activeTabId:     s.activeTabId,
        enableProfiling: s.enableProfiling,
      }),
    }
  )
)
