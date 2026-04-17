import { X, Keyboard } from 'lucide-react'

interface Props {
  isOpen:  boolean
  onClose: () => void
}

const shortcuts = [
  {
    category: 'Editor',
    items: [
      { keys: ['Ctrl', 'Enter'],  desc: 'Run code' },
      { keys: ['Ctrl', 'T'],      desc: 'New editor tab' },
      { keys: ['Ctrl', 'W'],      desc: 'Close current tab' },
      { keys: ['Ctrl', 'Z'],      desc: 'Undo' },
      { keys: ['Ctrl', 'Y'],      desc: 'Redo' },
      { keys: ['Ctrl', 'A'],      desc: 'Select all' },
      { keys: ['Ctrl', '/'],      desc: 'Toggle comment' },
      { keys: ['Alt', 'Shift', 'F'], desc: 'Format code' },
      { keys: ['Tab'],            desc: 'Indent (4 spaces)' },
      { keys: ['Shift', 'Tab'],   desc: 'Unindent' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { keys: ['Ctrl', 'H'],      desc: 'Toggle history panel' },
      { keys: ['Ctrl', 'K'],      desc: 'Toggle shortcuts panel' },
      { keys: ['Ctrl', 'E'],      desc: 'Toggle export panel' },
      { keys: ['Escape'],         desc: 'Close any open modal' },
    ],
  },
  {
    category: 'Results',
    items: [
      { keys: ['Ctrl', '1'],      desc: 'Switch to Output tab' },
      { keys: ['Ctrl', '2'],      desc: 'Switch to Profiling tab' },
      { keys: ['Ctrl', '3'],      desc: 'Switch to Score tab' },
    ],
  },
]

export default function KeyboardShortcuts({ isOpen, onClose }: Props) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ks-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="ks-header">
          <div className="ks-title">
            <Keyboard size={16} />
            <span>Keyboard Shortcuts</span>
          </div>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Shortcuts list */}
        <div className="ks-body">
          {shortcuts.map(group => (
            <div key={group.category} className="ks-group">
              <p className="ks-category">{group.category}</p>
              <div className="ks-list">
                {group.items.map((item, i) => (
                  <div key={i} className="ks-row">
                    <span className="ks-desc">{item.desc}</span>
                    <div className="ks-keys">
                      {item.keys.map((key, j) => (
                        <span key={j} className="ks-key">{key}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
