import { useState, useRef, useEffect } from 'react'
import { Trash2, RotateCcw, Clock, ChevronRight, Pencil, Check, X } from 'lucide-react'
import { useStore, type HistoryEntry } from '@/store/useStore'

function formatTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString()
}

// ── Single card ───────────────────────────────────────────────────────────────
function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const { loadFromHistory, deleteFromHistory, renameHistoryEntry } = useStore()
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(entry.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(entry.name)
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [editing, entry.name])

  const commitRename = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== entry.name) renameHistoryEntry(entry.id, trimmed)
    setEditing(false)
  }
  const cancelRename = () => { setDraft(entry.name); setEditing(false) }

  return (
    <div className="hist-card" onClick={() => !editing && loadFromHistory(entry)}>

      {/* Top — name + actions */}
      <div className="hist-card-top">

        {editing ? (
          <div className="hist-rename-row" onClick={e => e.stopPropagation()}>
            <input
              ref={inputRef}
              className="hist-rename-input"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter')  commitRename()
                if (e.key === 'Escape') cancelRename()
              }}
              maxLength={60}
            />
            <button className="hist-rename-btn ok" onClick={commitRename}><Check size={12} /></button>
            <button className="hist-rename-btn"    onClick={cancelRename}><X    size={12} /></button>
          </div>
        ) : (
          <p className="hist-name">{entry.name}</p>
        )}

        <div className="hist-card-actions" onClick={e => e.stopPropagation()}>
          <button className="hist-action-btn"        title="Rename" onClick={() => setEditing(true)}>
            <Pencil size={11} />
          </button>
          <button className="hist-action-btn danger" title="Delete" onClick={() => deleteFromHistory(entry.id)}>
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Bottom — only timestamp + arrow */}
      <div className="hist-card-bottom">
        <span className="hist-time"><Clock size={11} />{formatTime(entry.timestamp)}</span>
        <ChevronRight size={12} className="hist-arrow" />
      </div>

    </div>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export default function HistoryPanel() {
  const { history, clearHistory, historyOpen } = useStore()

  return (
    <aside className={`history-panel ${historyOpen ? 'open' : ''}`}>
      <div className="hist-header">
        <div className="hist-title">
          <RotateCcw size={14} />
          <span>Run History</span>
          {history.length > 0 && <span className="hist-count">{history.length}</span>}
        </div>
        {history.length > 0 && (
          <button className="hist-clear-btn" onClick={clearHistory} title="Clear all">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="hist-body">
        {history.length === 0 ? (
          <div className="hist-empty">
            <Clock size={28} strokeWidth={1.2} />
            <p>No runs yet</p>
            <p className="hist-empty-sub">Each execution will appear here</p>
          </div>
        ) : (
          <div className="hist-list">
            {history.map(entry => (
              <HistoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="hist-footer">Click any entry to load it into the editor</div>
      )}
    </aside>
  )
}
