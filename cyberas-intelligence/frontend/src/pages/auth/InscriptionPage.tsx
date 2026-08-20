import { useState } from 'react'
import { Mail, Lock, User, ArrowRight, CheckCircle, Shield, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function InscriptionPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [step, setStep] = useState<'role' | 'email' | 'verification'>('role')
  const [role, setRole] = useState<'rssi' | 'auditeur' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleRoleSelect = (selectedRole: 'rssi' | 'auditeur') => {
    setRole(selectedRole)
    setStep('email')
    setError('')
    setMessage('')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Simulation d'envoi d'email
      setMessage('Vérification envoyée. Consultez votre email pour le code.')
      setStep('verification')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Accepter n'importe quel code en mode démo
      await signup(email, password, role || 'auditeur')
      setMessage('Email vérifié ! Redirection...')
      setTimeout(() => {
        navigate(role === 'rssi' ? '/app/rssi' : '/app/auditeur')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la vérification')
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
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield size={32} className="text-brand" />
            <span className="text-2xl font-bold text-white">CYBERAS</span>
          </div>
          <p className="text-text-on-dark-muted">Plateforme unifiée de cybersécurité</p>
        </div>

        {/* Step 1: Role Selection */}
        {step === 'role' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-white">Inscription</h1>
              <p className="mt-2 text-text-on-dark-muted">Choisissez votre rôle dans l'organisation</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleRoleSelect('rssi')}
                className="w-full rounded-lg border-2 border-border-dark hover:border-brand bg-surface-dark hover:bg-surface-dark/80 p-6 text-left transition-all group shadow-lg hover:shadow-brand/20"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-brand/10 group-hover:from-brand/30 group-hover:to-brand/20 transition">
                    <Lock size={24} className="text-brand" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white">RSSI / Administrateur</h2>
                    <p className="text-sm text-text-on-dark-muted">Gérez votre organisation et auditeurs</p>
                  </div>
                  <ArrowRight className="text-brand opacity-0 group-hover:opacity-100 transition" size={20} />
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('auditeur')}
                className="w-full rounded-lg border-2 border-border-dark hover:border-brand bg-surface-dark hover:bg-surface-dark/80 p-6 text-left transition-all group shadow-lg hover:shadow-brand/20"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-brand/10 group-hover:from-brand/30 group-hover:to-brand/20 transition">
                    <User size={24} className="text-brand" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white">Auditeur</h2>
                    <p className="text-sm text-text-on-dark-muted">Consultez les missions et projets assignés</p>
                  </div>
                  <ArrowRight className="text-brand opacity-0 group-hover:opacity-100 transition" size={20} />
                </div>
              </button>
            </div>

            <p className="text-center text-sm text-text-on-dark-muted">
              Déjà inscrit ? <a href="/login" className="text-brand hover:underline font-semibold">Se connecter</a>
            </p>
          </div>
        )}

        {/* Step 2: Email & Password */}
        {step === 'email' && (
          <form onSubmit={handleSignup} className="space-y-6 bg-surface-dark/50 backdrop-blur-sm border border-border-dark rounded-xl p-8">
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('role')}
                className="text-text-on-dark-muted hover:text-white transition text-sm mb-4 inline-flex items-center gap-1"
              >
                ← Retour
              </button>
              <h1 className="text-2xl font-extrabold text-white">
                {role === 'rssi' ? 'Inscription RSSI' : 'Inscription Auditeur'}
              </h1>
              <p className="mt-2 text-text-on-dark-muted text-sm">Créez votre compte sécurisé</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500 p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-text-on-dark">Email professionnel</span>
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
                <span className="text-sm font-medium text-text-on-dark">Mot de passe sécurisé</span>
                <div className="mt-2 relative">
                  <Lock size={18} className="absolute left-3 top-3 text-text-on-dark-muted" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none transition"
                  />
                </div>
                <p className="mt-1 text-xs text-text-on-dark-muted">🔒 Chiffré de bout en bout</p>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-brand to-brand-dark hover:shadow-lg hover:shadow-brand/50 disabled:opacity-50 disabled:shadow-none text-white font-semibold py-2.5 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Envoi en cours...' : 'Continuer'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {/* Step 3: Email Verification */}
        {step === 'verification' && (
          <form onSubmit={handleVerify} className="space-y-6 bg-surface-dark/50 backdrop-blur-sm border border-border-dark rounded-xl p-8">
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 border border-brand/30 mx-auto mb-4">
                <CheckCircle size={32} className="text-brand" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">Vérifier votre email</h1>
              <p className="mt-2 text-text-on-dark-muted text-sm">
                Nous avons envoyé un code à<br />
                <span className="text-text-on-dark font-medium">{email}</span>
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500 p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg bg-green-500/10 border border-green-500 p-3 text-green-400 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> {message}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Code de vérification (6 chiffres)</span>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full mt-2 px-4 py-3 rounded-lg border border-border-dark bg-bg-dark text-white text-center text-3xl tracking-widest placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none transition font-mono"
              />
            </label>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full rounded-lg bg-gradient-to-r from-brand to-brand-dark hover:shadow-lg hover:shadow-brand/50 disabled:opacity-50 disabled:shadow-none text-white font-semibold py-2.5 transition"
            >
              {loading ? 'Vérification...' : 'Valider mon email'}
            </button>

            <p className="text-center text-sm text-text-on-dark-muted">
              Pas reçu ? <button type="button" className="text-brand hover:underline font-semibold">Renvoyer le code</button>
            </p>
          </form>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-text-on-dark-muted">
          En vous inscrivant, vous acceptez nos conditions d'utilisation · Politique de confidentialité
        </p>
      </div>
    </div>
  )
}
