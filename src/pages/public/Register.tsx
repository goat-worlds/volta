import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, HardHat, Search, type LucideIcon } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { HOME_BY_ROLE } from '../../components/RequireRole'
import { Card } from '../../components/ui'
import type { Role } from '../../store/types'

/**
 * Création de compte.
 *
 * L'inscription ne créait que des clients : un loueur d'engins ou un bureau de
 * vérification n'avait aucun moyen d'entrer sur la plateforme, alors que les
 * deux espaces existaient. Le rôle se choisit donc en premier — c'est lui qui
 * décide des champs demandés et de l'espace où l'on atterrit.
 *
 * ADMIN n'y figure pas : arbitrer entre fournisseur et client ne s'obtient pas
 * en cochant une case. Le serveur refuse ce rôle même si on le lui envoie.
 */

const ROLES: { value: Role; label: string; pitch: string; icon: LucideIcon }[] = [
  {
    value: 'CLIENT',
    label: 'Je loue des engins',
    pitch: 'Chercher au catalogue, demander des devis, suivre vos locations.',
    icon: Search,
  },
  {
    value: 'SUPPLIER',
    label: 'Je loue mes engins',
    pitch: 'Déclarer votre parc, le faire vérifier, recevoir des demandes.',
    icon: Building2,
  },
  {
    value: 'TECHNICAL',
    label: "Je vérifie les engins",
    pitch: "Recevoir les missions d'inspection et transmettre vos rapports.",
    icon: HardHat,
  },
]

export default function Register() {
  const { register } = useStore()
  const navigate = useNavigate()

  const [role, setRole] = useState<Role>('CLIENT')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Un fournisseur et un vérificateur agissent au nom d'une structure : c'est
  // cette raison sociale qu'affichent le catalogue et les rapports.
  const needsCompany = role !== 'CLIENT'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const user = await register({ name, email, phone, password, role, company, city })
      navigate(HOME_BY_ROLE[user.role] ?? '/')
    } catch {
      setError("Inscription impossible. Vérifiez vos informations — l'email est peut-être déjà utilisé.")
    } finally {
      setBusy(false)
    }
  }

  const field = 'w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-amber-500 focus:outline-none'
  const label = 'mb-1 block text-sm font-medium text-slate-700'

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <Card className="p-8">
        <div className="mb-6 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-xl font-black text-slate-900">
            V
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Créer un compte</h1>
          <p className="mt-1 text-sm text-slate-500">Dites-nous ce que vous venez faire sur VOLTA.</p>
        </div>

        <fieldset className="mb-6">
          <legend className="mb-2 text-sm font-medium text-slate-700">Votre profil</legend>
          <div className="grid gap-2">
            {ROLES.map((r) => {
              const selected = role === r.value
              return (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                    selected ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    className="sr-only"
                    checked={selected}
                    onChange={() => setRole(r.value)}
                  />
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      selected ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <r.icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">{r.label}</span>
                    <span className="block text-xs text-slate-500">{r.pitch}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className={label}>Nom complet</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jean Konan"
              className={field}
            />
          </div>

          {needsCompany && (
            <div>
              <label className={label}>
                {role === 'SUPPLIER' ? 'Raison sociale' : 'Nom du bureau de vérification'}
              </label>
              <input
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={role === 'SUPPLIER' ? 'BTP CI SARL' : 'Société Technique ABC'}
                className={field}
              />
            </div>
          )}

          <div>
            <label className={label}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.ci"
              className={field}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Téléphone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+225 07 00 00 00"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Ville</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Abidjan"
                className={field}
              />
            </div>
          </div>

          <div>
            <label className={label}>Mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6 caractères minimum"
              className={field}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-amber-400 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-500 disabled:opacity-60"
          >
            {busy ? 'Inscription…' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="font-semibold text-amber-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </Card>
    </div>
  )
}
