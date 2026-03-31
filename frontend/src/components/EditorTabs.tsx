import { useState, useRef, useEffect } from 'react'
import { X, Plus, Pencil, Check } from 'lucide-react'
import { useStore, type EditorTab } from '@/store/useStore'

// ── Single tab ────────────────────────────────────────────────────────────────
function Tab({ tab, isActive }: { tab: EditorTab; isActive: boolean }) {
  const { switchTab, closeTab, renameTab, tabs } = useStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(tab.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(tab.name)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 40)
    }
  }, [editing, tab.name])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed) renameTab(tab.id, trimmed)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(tab.name)
    setEditing(false)
  }

  // File icon colour based on extension
  const isPylite = tab.name.endsWith('.pylite') || tab.name.endsWith('.py')

  return (
    <div
      className={`editor-tab ${isActive ? 'editor-tab-active' : ''}`}
      onClick={() => switchTab(tab.id)}
      onDoubleClick={() => setEditing(true)}
      title={editing ? undefined : `${tab.name} — double-click to rename`}
    >
      {/* File icon */}
      <span className={`tab-file-icon ${isPylite ? 'icon-py' : 'icon-txt'}`}>
        {isPylite ? '🐍' : '📄'}
      </span>

      {/* Name — editable on double-click */}
      {editing ? (
        <input
          ref={inputRef}
          className="tab-rename-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') cancel()
            e.stopPropagation()
          }}
          onBlur={commit}
          onClick={e => e.stopPropagation()}
          maxLength={40}
        />
      ) : (
        <span className="tab-name">{tab.name}</span>
      )}

      {/* Close button — hidden when only 1 tab */}
      {tabs.length > 1 && (
        <button
          className="tab-close"
          title="Close tab"
          onClick={e => { e.stopPropagation(); closeTab(tab.id) }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

// ── Tab bar ───────────────────────────────────────────────────────────────────
export default function EditorTabs() {
  const { tabs, activeTabId, addTab } = useStore()

  return (
    <div className="editor-tabs-bar">
      <div className="editor-tabs-list">
        {tabs.map(tab => (
          <Tab key={tab.id} tab={tab} isActive={tab.id === activeTabId} />
        ))}
      </div>

      {/* New tab button */}
      <button className="new-tab-btn" onClick={addTab} title="New tab">
        <Plus size={14} />
      </button>
    </div>
  )
}
