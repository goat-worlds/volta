import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Card } from '../../components/ui'
import { IconHourglass, IconCheck, IconWrench, IconWarning } from '../../components/Icons'

type UserRole = 'CLIENT' | 'SUPPLIER' | 'TECHNICAL' | 'ADMIN'

const demoAccounts = [
  { email: 'client@volta.ci', password: 'password123', role: 'CLIENT' as UserRole, company: 'Acme Construction' },
  { email: 'supplier@volta.ci', password: 'password123', role: 'SUPPLIER' as UserRole, company: 'BTP Solutions' },
  { email: 'technical@volta.ci', password: 'password123', role: 'TECHNICAL' as UserRole, company: 'VOLTA Tech' },
  { email: 'admin@volta.ci', password: 'password123', role: 'ADMIN' as UserRole, company: 'VOLTA Admin' },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState((location.state?.email) || '')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const success = (location.state?.message) || ''

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    const account = demoAccounts.find(a => a.email === email && a.password === password)

    if (account) {
      // Store user session
      localStorage.setItem('volta_user', JSON.stringify({
        email: account.email,
        role: account.role,
        company: account.company,
        loginTime: new Date().toISOString(),
      }))

      // Redirect based on role
      const routes: Record<UserRole, string> = {
        CLIENT: '/client-dashboard',
        SUPPLIER: '/supplier-dashboard',
        TECHNICAL: '/technical-dashboard',
        ADMIN: '/admin-dashboard',
      }

      setTimeout(() => navigate(routes[account.role]), 300)
    } else {
      setError('Email ou mot de passe incorrect. Utilisez les comptes de démonstration ci-dessous.')
    }

    setIsLoading(false)
  }

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    setEmail(account.email)
    setPassword(account.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-lg">
              <img src="/volta-logo.svg" alt="VOLTA" className="h-8 w-8" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">VOLTA</div>
              <div className="text-xs text-brand-100">Se connecter</div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2">
            <IconCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700">{success}</p>
          </div>
        )}

        {/* Login Form Card */}
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-2 text-slate-900">
            Bienvenue
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            Connectez-vous à votre compte VOLTA
          </p>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <IconWarning className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@volta.ci"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className={`w-full py-2.5 rounded-lg text-white font-semibold transition flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-brand-400'
                  : 'bg-brand-600 hover:bg-brand-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <IconHourglass className="w-4 h-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <IconCheck className="w-4 h-4" />
                  Se connecter
                </>
              )}
            </button>
          </form>
        </Card>

        {/* Demo Accounts */}
        <div className="mb-6">
          <p className="text-center text-white text-sm font-semibold mb-3">
            Comptes de démonstration
          </p>
          <div className="grid grid-cols-2 gap-3">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                onClick={() => handleDemoLogin(account)}
                className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition transform hover:scale-105 border border-white/20 text-sm font-medium"
              >
                <div className="font-bold flex items-center gap-1">
                  {account.role === 'CLIENT' && <IconCheck className="w-4 h-4" />}
                  {account.role === 'SUPPLIER' && <IconCheck className="w-4 h-4" />}
                  {account.role === 'TECHNICAL' && <IconWrench className="w-4 h-4" />}
                  {account.role === 'ADMIN' && <IconCheck className="w-4 h-4" />}
                  <span>
                    {account.role === 'CLIENT' ? 'Client' :
                    account.role === 'SUPPLIER' ? 'Fournisseur' :
                    account.role === 'TECHNICAL' ? 'Technique' :
                    'Admin'}
                  </span>
                </div>
                <div className="text-xs text-brand-100 mt-1">{account.company}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-white text-sm">
            Pas encore de compte?{' '}
            <Link to="/signup" className="font-bold hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
