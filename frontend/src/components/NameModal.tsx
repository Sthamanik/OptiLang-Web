import { useState, useEffect, useRef } from 'react'
import { Tag, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onConfirm: (name: string) => void
  onCancel:  () => void
}

export default function NameModal({ isOpen, onConfirm, onCancel }: Props) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [isOpen])

  const handleSubmit = () => {
    onConfirm(name.trim() || 'Untitled run')
    setName('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter')  handleSubmit()
    if (e.key === 'Escape') onCancel()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <Tag size={15} />
          <span>Name this run</span>
          <button className="modal-close" onClick={onCancel}><X size={14} /></button>
        </div>

        <p className="modal-sub">
          Give this execution a name so you can find it in history
        </p>

        <input
          ref={inputRef}
          className="modal-input"
          type="text"
          placeholder="e.g. Fibonacci test, Prime check…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKey}
          maxLength={60}
        />

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-btn-run"    onClick={handleSubmit}>▶ Run</button>
        </div>

      </div>
    </div>
  )
}
