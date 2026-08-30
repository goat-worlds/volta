import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card } from '../../components/ui'

export default function Register() {
  const { register } = useStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await register(name, email, phone, password)
      navigate('/catalogue')
    } catch {
      setError("Inscription impossible. Vérifiez vos informations (email peut-être déjà utilisé).")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <div className="mb-6 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-xl font-black text-slate-900">V</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Créer un compte</h1>
          <p className="mt-1 text-sm text-slate-500">Rejoignez VOLTA pour louer des engins vérifiés</p>
        </div>
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nom complet</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jean Konan"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-yellow-500 focus:outline-none"
            />
          </div>
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
            <label className="mb-1 block text-sm font-medium text-slate-700">Téléphone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+225 07 00 00 00"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6 caractères minimum"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-yellow-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-yellow-400 py-2.5 font-semibold text-slate-900 hover:bg-yellow-500 disabled:opacity-60"
          >
            {busy ? 'Inscription…' : "S'inscrire"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="font-semibold text-yellow-600 hover:underline">Se connecter</Link>
        </p>
      </Card>
    </div>
  )
}
