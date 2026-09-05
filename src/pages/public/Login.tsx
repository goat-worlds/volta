import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { HOME_BY_ROLE } from '../../components/RequireRole'
import { Card } from '../../components/ui'

/** Comptes semés par DataSeeder, pour entrer dans un espace sans le remplir. */
const DEMO_ACCOUNTS = [
  { label: 'Client', email: 'jean@konan.ci' },
  { label: 'Fournisseur', email: 'contact@btpci.ci' },
  { label: 'Technique', email: 'inspection@abc.ci' },
  { label: 'Administration', email: 'admin@volta.ci' },
]
const DEMO_PASSWORD = 'password123'

export default function Login() {
  const { login } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  /** Page demandée avant d'être renvoyé ici par la garde de route. */
  const from = (location.state as { from?: string } | null)?.from

  const enter = async (mail: string, pass: string, failure: string) => {
    setBusy(true)
    setError(null)
    try {
      const user = await login(mail, pass)
      // On revient là où l'utilisateur allait, à condition que ce soit bien son
      // espace : sinon la garde le renverrait aussitôt, et il ferait l'aller-
      // retour sans comprendre pourquoi.
      const home = HOME_BY_ROLE[user.role] ?? '/'
      navigate(from && from.startsWith(home) ? from : home, { replace: true })
    } catch {
      setError(failure)
    } finally {
      setBusy(false)
    }
  }

  const field = 'w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-amber-500 focus:outline-none'

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <div className="mb-6 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-xl font-black text-slate-900">
            V
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Connexion</h1>
          <p className="mt-1 text-sm text-slate-500">Accédez à votre espace VOLTA</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void enter(email, password, 'Email ou mot de passe incorrect.')
          }}
          className="grid gap-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.ci"
              className={field}
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
              className={field}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-amber-400 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-500 disabled:opacity-60"
          >
            {busy ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="font-semibold text-amber-600 hover:underline">
            S'inscrire
          </Link>
        </p>

        <div className="mt-8 border-t border-slate-200 pt-5">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            Comptes de démonstration
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                disabled={busy}
                onClick={() => void enter(a.email, DEMO_PASSWORD, `Connexion impossible avec ${a.email}.`)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 disabled:opacity-60"
              >
                {a.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            Mot de passe commun : <span className="font-mono">{DEMO_PASSWORD}</span>
          </p>
        </div>
      </Card>
    </div>
  )
}
