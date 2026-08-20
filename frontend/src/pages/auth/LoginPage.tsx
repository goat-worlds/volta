import { useState } from 'react'
import { Mail, Lock, ArrowRight, Shield, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('demo@cyberas.ci')
  const [password, setPassword] = useState('demo123456')
  const [role, setRole] = useState<'rssi' | 'auditeur' | 'admin'>('rssi')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password, role)
      navigate(role === 'rssi' ? '/app/rssi' : role === 'admin' ? '/app/admin' : '/app/auditeur')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (quickRole: 'rssi' | 'auditeur' | 'admin') => {
    setLoading(true)
    try {
      const quickEmail = `${quickRole}@cyberas.ci`
      await login(quickEmail, 'demo123456', quickRole)
      navigate(quickRole === 'rssi' ? '/app/rssi' : quickRole === 'admin' ? '/app/admin' : '/app/auditeur')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-surface-dark to-bg-dark flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Bouton Retour */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-text-on-dark-muted hover:text-white transition"
        aria-label="Retour à l'accueil"
      >
        <ChevronLeft size={24} />
        <span className="text-sm font-medium hidden sm:inline">Retour</span>
      </button>

      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-brand rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-brand rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield size={32} className="text-brand" />
              <span className="text-2xl font-bold text-white">CYBERAS</span>
            </div>
            <p className="text-text-on-dark-muted">Plateforme unifiée de cybersécurité</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 bg-surface-dark/50 backdrop-blur-sm border border-border-dark rounded-xl p-8">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500 p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-text-on-dark-muted">Rôle</label>
              <div className="grid grid-cols-3 gap-2">
                {['rssi', 'auditeur', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r as any)}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition ${
                      role === r
                        ? 'bg-brand text-white'
                        : 'bg-bg-dark text-text-on-dark-muted hover:text-text-on-dark border border-border-dark'
                    }`}
                  >
                    {r === 'rssi' ? 'RSSI' : r === 'auditeur' ? 'Auditeur' : 'Admin'}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Email</span>
              <div className="mt-2 relative">
                <Mail size={18} className="absolute left-3 top-3 text-text-on-dark-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.ci"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none transition"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Mot de passe</span>
              <div className="mt-2 relative">
                <Lock size={18} className="absolute left-3 top-3 text-text-on-dark-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none transition"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-brand to-brand-dark hover:shadow-lg hover:shadow-brand/50 disabled:opacity-50 disabled:shadow-none text-white font-semibold py-2.5 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div>
            <p className="text-center text-xs text-text-on-dark-muted mb-3">ACCÈS RAPIDE (MODE DÉMO)</p>
            <div className="grid grid-cols-3 gap-2">
              {['rssi', 'auditeur', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => quickLogin(r as any)}
                  disabled={loading}
                  className="rounded-lg border border-border-dark bg-surface-dark/50 hover:bg-surface-dark text-text-on-dark hover:text-white disabled:opacity-50 font-semibold py-2 px-3 text-xs transition"
                >
                  {r === 'rssi' ? '🔒 RSSI' : r === 'auditeur' ? '👤 Auditeur' : '⚙️ Admin'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-border-dark" />
            <span className="text-sm text-text-on-dark-muted">Nouveau ?</span>
            <div className="flex-1 border-t border-border-dark" />
          </div>

          <button
            onClick={() => navigate('/inscription')}
            className="w-full rounded-lg border border-border-dark hover:border-brand text-text-on-dark hover:text-white font-semibold py-2.5 transition"
          >
            Créer un compte
          </button>

          <p className="text-center text-xs text-text-on-dark-muted">
            Mode démo - Aucun backend n'est nécessaire
          </p>
        </div>
      </div>
    </div>
  )
}
