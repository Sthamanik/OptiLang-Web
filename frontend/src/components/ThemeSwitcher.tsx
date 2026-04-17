import { Sun, Moon, Monitor } from 'lucide-react'

export type Theme = 'dark' | 'light' | 'high-contrast'

interface Props {
  current: Theme
  onChange: (theme: Theme) => void
}

const themes: { id: Theme; icon: React.ReactNode; label: string }[] = [
  { id: 'dark',          icon: <Moon size={14} />,    label: 'Dark' },
  { id: 'light',         icon: <Sun size={14} />,     label: 'Light' },
  { id: 'high-contrast', icon: <Monitor size={14} />, label: 'High Contrast' },
]

export default function ThemeSwitcher({ current, onChange }: Props) {
  return (
    <div className="theme-switcher" title="Switch theme">
      {themes.map(t => (
        <button
          key={t.id}
          className={`theme-btn ${current === t.id ? 'theme-btn-active' : ''}`}
          onClick={() => onChange(t.id)}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}
    </div>
  )
}
