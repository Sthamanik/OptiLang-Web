import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ExecutionResult, Suggestion, ProfilingData, ScoreReport } from '@/types'
import type { Theme } from '@/components/ThemeSwitcher'

// ── Auth user ────────────────────────────────────────────────────────────────
export interface AppUser {
  id:    string
  name:  string
  email: string
}

// Guest run limits — exported so App.tsx can import them
export const GUEST_MAX_RUNS     = 5   // total guest runs allowed
export const GUEST_FULL_RESULTS = 3   // first N runs show profiling + score

export interface EditorTab {
  id:           string
  name:         string
  code:         string
  runName:      string | null  // ← name given on first run
  hasBeenNamed: boolean        // ← true after first run
}

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

interface EditorStore {
  // Tabs
  tabs:        EditorTab[]
  activeTabId: string
  activeCode:  () => string
  addTab:           ()                                    => void
  closeTab:         (id: string)                          => void
  switchTab:        (id: string)                          => void
  switchTabByIndex: (index: number)                       => void
  nextTab:          ()                                    => void
  prevTab:          ()                                    => void
  renameTab:        (id: string, name: string)            => void
  updateTabCode:    (id: string, code: string)            => void
  markTabNamed:     (id: string, runName: string)         => void  // ← NEW
  _saveTabs:        ()                                    => void

  // Auth
  user:          AppUser | null
  guestRunCount: number          // how many times guest has run
  authModalOpen: boolean
  authModalTab:  'login' | 'signup'
  openAuthModal:  (tab?: 'login' | 'signup') => void
  closeAuthModal: () => void
  login:   (email: string, pass: string)              => Promise<boolean>
  signup:  (name: string, email: string, pass: string) => Promise<boolean>
  logout:  () => void
  incrementGuestRun: () => void
  // Derived helpers (not stored, computed)
  canRun:             () => boolean
  guestFullResults:   () => boolean

  // Sidebar (tabs panel)
  sidebarOpen:   boolean
  toggleSidebar: () => void

  // Settings
  enableProfiling: boolean
  setEnableProfiling: (v: boolean) => void
  timeout: number
  setTimeout: (v: number) => void

  // Theme
  theme: Theme
  setTheme: (t: Theme) => void

  // Run state
  isRunning: boolean
  setIsRunning: (v: boolean) => void

  // Last run name for export
  lastRunName: string
  setLastRunName: (n: string) => void

  // Modals
  nameModalOpen:  boolean
  openNameModal:  () => void
  closeNameModal: () => void
  shortcutsOpen:  boolean
  openShortcuts:  () => void
  closeShortcuts: () => void
  exportOpen:     boolean
  openExport:     () => void
  closeExport:    () => void

  // Results
  output:          string
  errors:          string[]
  executionTimeMs: number | null
  profiling:       ProfilingData | null
  score:           ScoreReport  | null
  suggestions:     Suggestion[]
  setResult:   (result: ExecutionResult) => void
  clearResult: () => void

  activeTab: 'output' | 'profiling' | 'score'
  setActiveTab: (tab: EditorStore['activeTab']) => void

  apiError: string | null
  setApiError: (msg: string | null) => void

  // History
  historyOpen:        boolean
  toggleHistory:      () => void
  history:            HistoryEntry[]
  addToHistory:       (entry: HistoryEntry)      => void
  deleteFromHistory:  (id: string)               => void
  renameHistoryEntry: (id: string, name: string) => void
  clearHistory:       () => void
  loadFromHistory:    (entry: HistoryEntry)       => void
}

let _tabCounter = 1
const newTab = (code = ''): EditorTab => ({
  id:           `tab-${Date.now()}-${_tabCounter++}`,
  name:         `untitled-${_tabCounter - 1}.pylite`,
  code,
  runName:      null,
  hasBeenNamed: false,
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

const initialTab: EditorTab = {
  id:           'tab-initial',
  name:         'main.pylite',
  code:         SAMPLE_CODE,
  runName:      null,
  hasBeenNamed: false,
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export const useStore = create<EditorStore>()(
  persist(
    (set, get) => ({
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
          if (s.tabs.length === 1) return s
          const idx     = s.tabs.findIndex(t => t.id === id)
          const newTabs = s.tabs.filter(t => t.id !== id)
          const newActive =
            s.activeTabId === id
              ? (newTabs[Math.min(idx, newTabs.length - 1)]?.id ?? newTabs[0].id)
              : s.activeTabId
          return { tabs: newTabs, activeTabId: newActive }
        })
      },

      switchTab:        (id)     => set({ activeTabId: id }),

      // Save tabs to user-specific localStorage after any mutation
      _saveTabs: () => {
        const s = get()
        if (s.user) {
          localStorage.setItem(
            `optilang_tabs_${s.user.id}`,
            JSON.stringify({ tabs: s.tabs, activeTabId: s.activeTabId })
          )
        }
      },
      switchTabByIndex: (index)  => {
        const { tabs } = get()
        const tab = tabs[index]
        if (tab) set({ activeTabId: tab.id })
      },
      nextTab: () => {
        const { tabs, activeTabId } = get()
        if (tabs.length <= 1) return
        const idx = tabs.findIndex(t => t.id === activeTabId)
        set({ activeTabId: tabs[(idx + 1) % tabs.length].id })
      },
      prevTab: () => {
        const { tabs, activeTabId } = get()
        if (tabs.length <= 1) return
        const idx = tabs.findIndex(t => t.id === activeTabId)
        set({ activeTabId: tabs[(idx - 1 + tabs.length) % tabs.length].id })
      },

      renameTab: (id, name) => {
        set(s => {
          // Find the tab being renamed
          const tab     = s.tabs.find(t => t.id === id)
          const oldRun  = tab?.runName ?? null

          // New run name = filename without .pylite extension
          const newRunName = name.endsWith('.pylite')
            ? name.slice(0, -7)
            : name.endsWith('.py')
            ? name.slice(0, -3)
            : name

          // Update the tab name + runName
          const tabs = s.tabs.map(t =>
            t.id === id ? { ...t, name, runName: newRunName, hasBeenNamed: true } : t
          )

          // Sync: update matching history entry if runName existed
          const history = oldRun
            ? s.history.map(e => e.name === oldRun ? { ...e, name: newRunName } : e)
            : s.history

          return { tabs, history }
        })
        get()._saveTabs()
      },
      updateTabCode: (id, code) => {
        set(s => ({ tabs: s.tabs.map(t => t.id === id ? { ...t, code } : t) }))
        get()._saveTabs()
      },

      // Mark a tab as named — also auto-renames the tab file
      markTabNamed: (id, runName) =>
        set(s => ({
          tabs: s.tabs.map(t => {
            if (t.id !== id) return t
            // Only rename if it's still an untitled tab
            const autoName = runName
              ? `${runName}.pylite`
              : t.name
            const newName = t.name.startsWith('untitled-') || t.name === 'main.pylite'
              ? autoName
              : t.name    // keep user-renamed tabs as-is
            return { ...t, runName, hasBeenNamed: !!runName, name: newName }
          }),
        })),

      // ── Auth ────────────────────────────────────────────────────────────────
      user:           null,
      guestRunCount:  0,
      authModalOpen:  false,
      authModalTab:   'login' as const,

      openAuthModal: (tab = 'login') =>
        set({ authModalOpen: true, authModalTab: tab }),
      closeAuthModal: () => set({ authModalOpen: false }),

      // Simple localStorage-based auth for demo
      // In production: call real API endpoints
      login: async (email, pass) => {
        const users: { id:string; name:string; email:string; pass:string }[] =
          JSON.parse(localStorage.getItem('optilang_users') ?? '[]')
        const found = users.find(u => u.email === email && u.pass === pass)
        if (!found) return false
        const user: AppUser = { id: found.id, name: found.name, email: found.email }
        // Load this user's saved history
        const userHistory = JSON.parse(
          localStorage.getItem(`optilang_history_${found.id}`) ?? '[]'
        )
        // Load this user's saved tabs (or start fresh)
        const userTabs = JSON.parse(
          localStorage.getItem(`optilang_tabs_${found.id}`) ?? 'null'
        )
        const freshTab: EditorTab = {
          id: `tab-${Date.now()}`, name: 'main.pylite', code: '',
          runName: null, hasBeenNamed: false,
        }
        const tabs      = userTabs?.tabs      ?? [freshTab]
        const activeTabId = userTabs?.activeTabId ?? freshTab.id
        set({ user, guestRunCount: 0, authModalOpen: false,
              history: userHistory, tabs, activeTabId })
        return true
      },

      signup: async (name, email, pass) => {
        const users: { id:string; name:string; email:string; pass:string }[] =
          JSON.parse(localStorage.getItem('optilang_users') ?? '[]')
        if (users.find(u => u.email === email)) return false
        const newUser = { id: `u-${Date.now()}`, name, email, pass }
        users.push(newUser)
        localStorage.setItem('optilang_users', JSON.stringify(users))
        const user: AppUser = { id: newUser.id, name, email }
        const freshTab: EditorTab = {
          id: `tab-${Date.now()}`, name: 'main.pylite', code: '',
          runName: null, hasBeenNamed: false,
        }
        set({ user, guestRunCount: 0, authModalOpen: false,
              history: [], tabs: [freshTab], activeTabId: freshTab.id })
        return true
      },

      logout: () => {
        const s = get()
        if (s.user) {
          // Save history
          localStorage.setItem(
            `optilang_history_${s.user.id}`,
            JSON.stringify(s.history)
          )
          // Save tabs
          localStorage.setItem(
            `optilang_tabs_${s.user.id}`,
            JSON.stringify({ tabs: s.tabs, activeTabId: s.activeTabId })
          )
        }
        // Reset to a clean guest state
        const guestTab: EditorTab = {
          id: `tab-${Date.now()}`, name: 'main.pylite', code: '',
          runName: null, hasBeenNamed: false,
        }
        set({ user: null, guestRunCount: 0, history: [],
              tabs: [guestTab], activeTabId: guestTab.id })
      },

      incrementGuestRun: () =>
        set(s => ({ guestRunCount: s.guestRunCount + 1 })),

      // Can user run at all?
      canRun: () => {
        const s = get()
        if (s.user) return true                       // logged in → always yes
        return s.guestRunCount < GUEST_MAX_RUNS        // guest → max 5
      },

      // Does guest see full results (profiling + score)?
      guestFullResults: () => {
        const s = get()
        if (s.user) return true                       // logged in → always full
        return s.guestRunCount <= GUEST_FULL_RESULTS   // first 3 runs = full
      },

      // Sidebar
      sidebarOpen:   true,
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

      enableProfiling: true,
      setEnableProfiling: (v) => set({ enableProfiling: v }),
      timeout: 10,
      setTimeout: (v) => set({ timeout: v }),

      theme: 'dark',
      setTheme: (t) => { applyTheme(t); set({ theme: t }) },

      isRunning: false,
      setIsRunning: (v) => set({ isRunning: v }),

      lastRunName: '',
      setLastRunName: (n) => set({ lastRunName: n }),

      nameModalOpen:  false,
      openNameModal:  () => set({ nameModalOpen: true }),
      closeNameModal: () => set({ nameModalOpen: false }),
      shortcutsOpen:  false,
      openShortcuts:  () => set({ shortcutsOpen: true }),
      closeShortcuts: () => set({ shortcutsOpen: false }),
      exportOpen:     false,
      openExport:     () => set({ exportOpen: true }),
      closeExport:    () => set({ exportOpen: false }),

      output: '', errors: [], executionTimeMs: null,
      profiling: null, score: null, suggestions: [],

      setResult: (r) => set({
        output: r.output, errors: r.errors,
        executionTimeMs: r.execution_time_ms,
        profiling: r.profiling, score: r.score, suggestions: r.suggestions,
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
        set(s => {
          // Only save history for logged-in users — guests get no history
          if (!s.user) return s

          // Deduplicate: same name → update existing entry and move to top
          const existingIdx = s.history.findIndex(e => e.name === entry.name)
          let newHistory: HistoryEntry[]
          if (existingIdx !== -1) {
            const updated = [...s.history]
            updated[existingIdx] = { ...entry, id: updated[existingIdx].id }
            const [found] = updated.splice(existingIdx, 1)
            newHistory = [found, ...updated].slice(0, 50)
          } else {
            newHistory = [entry, ...s.history].slice(0, 50)
          }

          // Persist to user-specific localStorage key
          if (s.user) {
            localStorage.setItem(
              `optilang_history_${s.user.id}`,
              JSON.stringify(newHistory)
            )
          }
          return { history: newHistory }
        }),
      deleteFromHistory: (id) =>
        set(s => ({ history: s.history.filter(e => e.id !== id) })),
      renameHistoryEntry: (id, name) =>
        set(s => {
          // Find the old name of this history entry
          const oldEntry = s.history.find(e => e.id === id)
          const oldName  = oldEntry?.name ?? ''

          // Update history entry name
          const history = s.history.map(e => e.id === id ? { ...e, name } : e)

          // Also update any tab whose runName matches the old history name
          // → updates the purple badge + the tab filename
          const tabs = s.tabs.map(t => {
            if (t.runName === oldName) {
              return {
                ...t,
                runName: name,
                // Rename the file too if it was auto-named from the run name
                name: t.name === `${oldName}.pylite` ? `${name}.pylite` : t.name,
              }
            }
            return t
          })

          return { history, tabs }
        }),
      clearHistory: () => set({ history: [] }),

      loadFromHistory: (entry) => {
        const tab = newTab(entry.code)
        tab.name         = `${entry.name}.pylite`
        tab.runName      = entry.name
        tab.hasBeenNamed = true   // loaded from history — already has a name
        set(s => ({ tabs: [...s.tabs, tab], activeTabId: tab.id, historyOpen: false }))
      },
    }),
    {
      name: 'optilang-storage',
      partialize: (s) => ({
        // Don't persist tabs/history globally — stored per-user in localStorage
        enableProfiling: s.enableProfiling,
        theme:           s.theme,
        sidebarOpen:     s.sidebarOpen,
        user:            s.user,
        guestRunCount:   s.guestRunCount,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme)
      },
    }
  )
)
