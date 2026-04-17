// Standalone auth page — navigated to from landing "Sign in" button
// Wraps the AuthModal logic in a full page for direct URL access
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Zap } from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import { useStore } from '@/store/useStore'

export default function AuthPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user } = useStore()
  const tab = (params.get('tab') === 'signup' ? 'signup' : 'login') as 'login' | 'signup'

  // If already logged in, redirect to editor
  useEffect(() => {
    if (user) navigate('/editor', { replace: true })
  }, [user, navigate])

  return (
    <div className="auth-page">
      <div className="auth-page-bg" />
      <div className="auth-page-header">
        <span className="auth-page-logo" onClick={() => navigate('/')}>
          <Zap size={16} className="brand-icon" />
          OptiLang
        </span>
      </div>
      <div className="auth-page-center">
        <AuthModal
          isOpen={true}
          onClose={() => navigate('/')}
          defaultTab={tab}
        />
      </div>
    </div>
  )
}
