import { useState, useRef, useEffect } from 'react'
import { X, Plus, ChevronDown, Check, Files } from 'lucide-react'
import { useStore, type EditorTab } from '@/store/useStore'

// ── Single tab row ────────────────────────────────────────────────────────────
function Tab({ tab, index, isActive }: { tab: EditorTab; index: number; isActive: boolean }) {
  const { switchTab, closeTab, renameTab, tabs } = useStore()
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(tab.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(tab.name)
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 40)
    }
  }, [editing, tab.name])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed) renameTab(tab.id, trimmed)
    setEditing(false)
  }
  const cancel = () => { setDraft(tab.name); setEditing(false) }
  const isPylite = tab.name.endsWith('.pylite') || tab.name.endsWith('.py')

  return (
    <div
      className={`sidebar-tab ${isActive ? 'sidebar-tab-active' : ''}`}
      onClick={() => switchTab(tab.id)}
      onDoubleClick={() => setEditing(true)}
      title={`${tab.name}${index < 9 ? ` — Ctrl+${index + 1}` : ''}\nDouble-click to rename`}
    >
      {/* Active accent line on left */}
      {isActive && <div className="sidebar-tab-accent" />}

      <span className="sidebar-tab-icon">{isPylite ? '🐍' : '📄'}</span>

      {editing ? (
        <input
          ref={inputRef}
          className="sidebar-tab-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter')  commit()
            if (e.key === 'Escape') cancel()
            e.stopPropagation()
          }}
          onBlur={commit}
          onClick={e => e.stopPropagation()}
          maxLength={40}
        />
      ) : (
        <span className="sidebar-tab-name">{tab.name}</span>
      )}

      {/* Run name badge — shows the name given on first run */}
      {tab.hasBeenNamed && tab.runName && (
        <span className="sidebar-tab-runname" title={`Run name: ${tab.runName}`}>
          {tab.runName.slice(0, 8)}{tab.runName.length > 8 ? '…' : ''}
        </span>
      )}

      {index < 9 && (
        <span className="sidebar-tab-index">{index + 1}</span>
      )}

      {tabs.length > 1 && (
        <button
          className="sidebar-tab-close"
          title="Close (Ctrl+W)"
          onClick={e => { e.stopPropagation(); closeTab(tab.id) }}
        >
          <X size={11} />
        </button>
      )}
    </div>
  )
}

// ── Open editors quick-pick ───────────────────────────────────────────────────
function QuickPick() {
  const { tabs, activeTabId, switchTab } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="sidebar-quickpick-wrap" ref={ref}>
      <button
        className={`sidebar-quickpick-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen(v => !v)}
        title="All open editors"
      >
        <ChevronDown size={12} />
        <span>{tabs.length}</span>
      </button>

      {open && (
        <div className="sidebar-quickpick-dropdown">
          <div className="sidebar-quickpick-header">Open Editors</div>
          {tabs.map((tab, i) => {
            const active   = tab.id === activeTabId
            const isPylite = tab.name.endsWith('.pylite') || tab.name.endsWith('.py')
            return (
              <div
                key={tab.id}
                className={`sidebar-quickpick-item ${active ? 'active' : ''}`}
                onClick={() => { switchTab(tab.id); setOpen(false) }}
              >
                <span>{isPylite ? '🐍' : '📄'}</span>
                <span className="sidebar-qp-name">{tab.name}</span>
                {i < 9 && <span className="sidebar-qp-key">Ctrl+{i + 1}</span>}
                {active && <Check size={11} className="sidebar-qp-check" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main sidebar ──────────────────────────────────────────────────────────────
export default function EditorTabs() {
  const { tabs, activeTabId, addTab, sidebarOpen } = useStore()

  return (
    <aside className={`editor-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>

      {/* Header */}
      <div className="sidebar-header">
        <Files size={13} />
        <span className="sidebar-header-title">Open Editors</span>
        <span className="sidebar-header-count">{tabs.length}</span>
      </div>

      {/* Tab list */}
      <div className="sidebar-tabs-list">
        {tabs.map((tab, i) => (
          <Tab key={tab.id} tab={tab} index={i} isActive={tab.id === activeTabId} />
        ))}
      </div>

      {/* Footer controls */}
      <div className="sidebar-footer">
        <QuickPick />
        <button className="sidebar-new-btn" onClick={addTab} title="New tab (Ctrl+T)">
          <Plus size={14} />
          <span>New</span>
        </button>
      </div>

    </aside>
  )
}
