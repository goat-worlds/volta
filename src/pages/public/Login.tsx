import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Search, ShieldCheck, Truck, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { HOME_BY_ROLE } from '../../components/RequireRole'
import { Card } from '../../components/ui'
import { roleTheme } from '../../lib/roleTheme'
import type { Role } from '../../store/types'

type DemoAccount = { label: string; email: string; password: string; role: Role }

/**
 * Comptes semés par DataSeeder en développement, où le jeu d'essai est actif.
 * Leur mot de passe est public, mais ces comptes n'existent que sur une machine
 * de développement : en ligne, le profil d'hébergement ne les crée pas.
 */
const LOCAL_DEMO_ACCOUNTS: DemoAccount[] = [
  { label: 'Client', email: 'jean@konan.ci', password: 'password123', role: 'CLIENT' },
  { label: 'Fournisseur', email: 'contact@btpci.ci', password: 'password123', role: 'SUPPLIER' },
  { label: 'Équipe technique', email: 'inspection@abc.ci', password: 'password123', role: 'TECHNICAL' },
  { label: 'Administration', email: 'admin@volta.ci', password: 'password123', role: 'ADMIN' },
]

/** Ce que chaque rôle vient faire ici, dit en une ligne sous son nom. */
const ROLE_PITCH: Record<Role, string> = {
  CLIENT: 'Chercher un engin, demander et comparer des devis',
  SUPPLIER: 'Déclarer ses engins, répondre aux demandes',
  TECHNICAL: 'Inspecter les engins et transmettre les rapports',
  ADMIN: 'Assigner les vérifications, classer et publier',
}

const ROLE_ICON: Record<Role, LucideIcon> = {
  CLIENT: Search,
  SUPPLIER: Truck,
  TECHNICAL: Wrench,
  ADMIN: ShieldCheck,
}

/**
 * Rôle d'un accès rapide.
 *
 * Il peut être déclaré en quatrième champ de VITE_DEMO_ACCOUNTS. À défaut, il
 * se déduit du libellé — c'est le cas des comptes locaux, et cela évite à
 * l'exploitant d'avoir à le répéter quand il écrit « Fournisseur ».
 */
function roleFromLabel(label: string): Role {
  // Les diacritiques sont détachés puis retirés par leur plage Unicode plutôt
  // qu'en toutes lettres : écrite littéralement, la plage dépend de l'encodage
  // du fichier et se casse au premier outil qui le réenregistre.
  const normalized = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  if (normalized.includes('admin') || normalized.includes('direction')) return 'ADMIN'
  if (normalized.includes('fournisseur') || normalized.includes('loueur')) return 'SUPPLIER'
  if (normalized.includes('technique') || normalized.includes('inspect')) return 'TECHNICAL'
  return 'CLIENT'
}

/**
 * Comptes d'essai d'une instance en ligne, déclarés par VITE_DEMO_ACCOUNTS sous
 * la forme « Libellé|adresse|mot de passe », séparés par des points-virgules.
 *
 * Ils ne sont pas écrits ici parce que le dépôt est public : des identifiants
 * valables sur une instance accessible y resteraient lisibles de tous, et pour
 * toujours. Passer par une variable de construction laisse le choix à
 * l'exploitant — la retirer et redéployer fait disparaître les boutons, sans
 * qu'aucun mot de passe n'ait jamais été versionné.
 *
 * Ces boutons restent une commodité de démonstration : quiconque ouvre le site
 * peut s'en servir. N'y mettre que des comptes dont c'est le rôle, jamais un
 * administrateur, et rien qui touche à des données réelles.
 */
function declaredAccounts(): DemoAccount[] {
  // Le projet ne déclare pas les types de vite/client : sans cette annotation,
  // la variable est « any » et tout ce qui suit l'est aussi.
  const raw = import.meta.env.VITE_DEMO_ACCOUNTS as string | undefined
  if (!raw) return []
  return raw
    .split(';')
    .map((entry) => entry.split('|').map((part) => part.trim()))
    // Le rôle est facultatif : trois champs suffisent, un quatrième le force.
    .filter((parts) => parts.length >= 3 && parts.slice(0, 3).every(Boolean))
    .map(([label, email, password, role]) => ({
      label,
      email,
      password,
      role: role ? roleFromLabel(role) : roleFromLabel(label),
    }))
}

const declared = declaredAccounts()
const DEMO_ACCOUNTS = declared.length > 0 ? declared : import.meta.env.DEV ? LOCAL_DEMO_ACCOUNTS : []

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

  const field = 'w-full rounded-lg border border-papier-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none'

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <div className="mb-6 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-xl font-black text-acier-900">
            V
          </span>
          <h1 className="mt-3 text-2xl font-bold text-acier-900">Connexion</h1>
          <p className="mt-1 text-sm text-papier-600">Accédez à votre espace VOLTA</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void enter(email, password, 'Email ou mot de passe incorrect.')
          }}
          className="grid gap-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-papier-700">Email</label>
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
            <label className="mb-1 block text-sm font-medium text-papier-700">Mot de passe</label>
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
            className="rounded-lg bg-amber-400 py-2.5 font-semibold text-acier-900 transition hover:bg-amber-500 disabled:opacity-60"
          >
            {busy ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-papier-600">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="font-semibold text-amber-600 hover:underline">
            S'inscrire
          </Link>
        </p>

        {DEMO_ACCOUNTS.length > 0 && (
          <div className="mt-8 border-t border-papier-200 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-papier-600">
              Entrer directement dans un espace
            </p>
            {/* Chaque accès porte la couleur et l'icône de son rôle, les mêmes
                que celles de l'espace où il mène : on choisit un métier, pas une
                ligne d'identifiants. */}
            <div className="grid gap-2">
              {DEMO_ACCOUNTS.map((a) => {
                const theme = roleTheme(a.role)
                const Icon = ROLE_ICON[a.role]
                return (
                  <button
                    key={a.email}
                    type="button"
                    disabled={busy}
                    onClick={() => void enter(a.email, a.password, `Connexion impossible avec ${a.email}.`)}
                    className={`group flex items-center gap-3 rounded-xl border border-papier-200 bg-white p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 ${theme.hoverCard}`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${theme.tileChip}`}
                    >
                      <Icon size={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-bold ${theme.text}`}>{a.label}</span>
                      <span className="block truncate text-[11px] leading-tight text-papier-600">
                        {ROLE_PITCH[a.role]}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[10px] text-papier-600">
                        {a.email} · {a.password}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-papier-300 transition group-hover:translate-x-0.5 group-hover:text-papier-600"
                    />
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-papier-600">Un clic connecte et ouvre l’espace du rôle.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
