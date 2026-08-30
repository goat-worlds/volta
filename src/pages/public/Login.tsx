import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card } from '../../components/ui'

export default function Login() {
  const { login } = useStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const user = await login(email, password)
      if (user.role === 'ADMIN') navigate('/admin')
      else if (user.role === 'SUPPLIER') navigate('/supplier')
      else if (user.role === 'TECHNICAL') navigate('/technical')
      else navigate('/catalogue')
    } catch {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <div className="mb-6 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-xl font-black text-slate-900">V</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Connexion</h1>
          <p className="mt-1 text-sm text-slate-500">Accédez à votre espace VOLTA</p>
        </div>
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.ci"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-yellow-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-yellow-400 py-2.5 font-semibold text-slate-900 hover:bg-yellow-500 disabled:opacity-60"
          >
            {busy ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="font-semibold text-yellow-600 hover:underline">S'inscrire</Link>
        </p>
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-400">
          Comptes de démonstration : admin@volta.ci, contact@btpci.ci, inspection@abc.ci, jean@konan.ci — mot de passe : volta123
        </p>
      </Card>
    </div>
  )
}
