import { useState, useRef, useEffect } from 'react'
import { X, Zap, Eye, EyeOff, User, Mail, Lock } from 'lucide-react'
import { useStore } from '@/store/useStore'

interface Props {
  isOpen:  boolean
  onClose: () => void
  defaultTab?: 'login' | 'signup'
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: Props) {
  const { login, signup } = useStore()
  const [tab,    setTab]    = useState<'login' | 'signup'>(defaultTab)
  const [name,   setName]   = useState('')
  const [email,  setEmail]  = useState('')
  const [pass,   setPass]   = useState('')
  const [show,   setShow]   = useState(false)
  const [err,    setErr]     = useState('')
  const [loading, setLoading] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab)
      setErr('')
      setName(''); setEmail(''); setPass('')
      setTimeout(() => emailRef.current?.focus(), 80)
    }
  }, [isOpen, defaultTab])

  if (!isOpen) return null

  const handleSubmit = async () => {
    setErr('')
    if (!email.trim() || !pass.trim()) { setErr('All fields are required.'); return }
    if (tab === 'signup' && !name.trim()) { setErr('Name is required.'); return }
    if (pass.length < 6) { setErr('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      if (tab === 'login') {
        const ok = await login(email.trim(), pass)
        if (!ok) { setErr('Invalid email or password.'); setLoading(false); return }
      } else {
        const ok = await signup(name.trim(), email.trim(), pass)
        if (!ok) { setErr('Email already in use.'); setLoading(false); return }
      }
      onClose()
    } catch {
      setErr('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-brand">
            <Zap size={16} className="auth-brand-icon" />
            <span>OptiLang</span>
          </div>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login'  ? 'auth-tab-active' : ''}`}
            onClick={() => { setTab('login');  setErr('') }}
          >
            Sign in
          </button>
          <button
            className={`auth-tab ${tab === 'signup' ? 'auth-tab-active' : ''}`}
            onClick={() => { setTab('signup'); setErr('') }}
          >
            Create account
          </button>
        </div>

        <div className="auth-body">
          <p className="auth-sub">
            {tab === 'login'
              ? 'Welcome back — sign in to access unlimited runs and your history.'
              : 'Create a free account to save your programs and run without limits.'}
          </p>

          {/* Name — signup only */}
          {tab === 'signup' && (
            <div className="auth-field">
              <label className="auth-label">Full name</label>
              <div className="auth-input-wrap">
                <User size={14} className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Manik Kumar Shrestha"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={14} className="auth-input-icon" />
              <input
                ref={emailRef}
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <Lock size={14} className="auth-input-icon" />
              <input
                className="auth-input auth-input-pass"
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button className="auth-show-btn" onClick={() => setShow(v => !v)} tabIndex={-1}>
                {show ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {err && <p className="auth-error">⚠ {err}</p>}

          {/* Submit */}
          <button
            className="auth-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? 'Please wait…'
              : tab === 'login' ? 'Sign in →' : 'Create account →'
            }
          </button>

          {/* Guest option */}
          <div className="auth-divider"><span>or</span></div>
          <button className="auth-guest-btn" onClick={onClose}>
            Continue as guest
            <span className="auth-guest-note">5 free runs · limited results</span>
          </button>

          {/* Switch tab */}
          <p className="auth-switch">
            {tab === 'login'
              ? <>Don't have an account? <button onClick={() => { setTab('signup'); setErr('') }}>Sign up free</button></>
              : <>Already have an account? <button onClick={() => { setTab('login'); setErr('') }}>Sign in</button></>
            }
          </p>
        </div>
      </div>
    </div>
  )
}
