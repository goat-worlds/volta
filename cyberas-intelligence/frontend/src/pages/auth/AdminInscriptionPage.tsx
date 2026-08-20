import { useState } from 'react'
import { Mail, Lock, User, ArrowRight, Shield, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AdminInscriptionPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !name) {
      setError('Tous les champs requis')
      return
    }
    setLoading(true)
    try {
      await signup(email, password, 'admin')
      navigate('/app/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-surface-dark to-bg-dark flex flex-col items-center justify-center px-4 py-12">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-text-on-dark-muted hover:text-white"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="mx-auto max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield size={32} className="text-brand" />
            <span className="text-2xl font-bold text-white">CYBERAS</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Registration</h1>
        </div>

        <form onSubmit={handleSignup} className="bg-surface-dark/50 border border-border-dark rounded-xl p-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500 p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <label>
            <span className="text-sm font-medium text-text-on-dark">Nom complet</span>
            <div className="mt-2 relative">
              <User size={18} className="absolute left-3 top-3 text-text-on-dark-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
              />
            </div>
          </label>

          <label>
            <span className="text-sm font-medium text-text-on-dark">Email</span>
            <div className="mt-2 relative">
              <Mail size={18} className="absolute left-3 top-3 text-text-on-dark-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
              />
            </div>
          </label>

          <label>
            <span className="text-sm font-medium text-text-on-dark">Mot de passe</span>
            <div className="mt-2 relative">
              <Lock size={18} className="absolute left-3 top-3 text-text-on-dark-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand to-brand-dark hover:shadow-lg disabled:opacity-50 text-white font-semibold transition"
          >
            {loading ? 'Creation...' : 'Creer compte'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-center text-xs text-text-on-dark-muted mt-4">
          Access Back-Office CYBERAS
        </p>
      </div>
    </div>
  )
}
