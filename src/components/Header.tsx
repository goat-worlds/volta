import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import type { Role } from '../store/types'

const NAV = [
  { to: '/', label: 'Accueil' },
  { to: '/catalogue', label: 'Équipements' },
  { to: '/fournisseurs', label: 'Fournisseurs' },
]

/** Chaque rôle a son espace : le raccourci mène là où l'utilisateur travaille. */
const HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: '/admin',
  SUPPLIER: '/supplier',
  TECHNICAL: '/technical',
  CLIENT: '/client',
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administration',
  SUPPLIER: 'Fournisseur',
  TECHNICAL: 'Équipe technique',
  CLIENT: 'Client',
}

export default function Header() {
  const { currentUser, logout } = useStore()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Le menu mobile reste ouvert après une navigation si personne ne le ferme :
  // l'utilisateur arrive sur la nouvelle page masquée par le panneau.
  useEffect(() => setMenuOpen(false), [location.pathname])

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const space = currentUser ? HOME_BY_ROLE[currentUser.role] : null

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* La bande signe l'univers chantier et remplace la bordure grise. */}
      <div className="btp-hazard-stripe h-1 w-full" aria-hidden />

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-acier-900 text-lg font-black text-btp-400">
              V
            </span>
            <span className="leading-none">
              <span className="block text-xl font-black tracking-tight text-acier-900">VOLTA</span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Engins vérifiés
              </span>
            </span>
          </Link>

          {/* La navigation publique reste accessible une fois connecté : le
              catalogue est le même pour tous, et la masquer enfermait
              l'utilisateur dans son espace. */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive(item.to)
                    ? 'bg-btp-50 text-btp-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-acier-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {currentUser && space ? (
              <>
                <Link
                  to={space}
                  className="hidden items-center gap-2 rounded-lg bg-acier-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-acier-800 sm:inline-flex"
                >
                  <LayoutDashboard size={15} />
                  Mon espace
                </Link>
                <div className="hidden text-right leading-tight lg:block">
                  <div className="text-sm font-semibold text-acier-900">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500">{ROLE_LABEL[currentUser.role]}</div>
                </div>
                <button
                  onClick={() => logout()}
                  aria-label="Déconnexion"
                  className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 sm:inline-flex"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/connexion"
                  className="hidden rounded-lg px-3.5 py-2 text-sm font-semibold text-acier-900 transition hover:bg-slate-50 sm:inline-block"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="rounded-lg bg-btp-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-btp-600"
                >
                  Inscription
                </Link>
              </>
            )}

            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              className="rounded-lg p-2 text-acier-900 transition hover:bg-slate-100 md:hidden"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(item.to) ? 'bg-btp-50 text-btp-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-slate-100 pt-2">
              {currentUser && space ? (
                <>
                  <Link
                    to={space}
                    className="flex items-center gap-2 rounded-lg bg-acier-900 px-3 py-2.5 text-sm font-semibold text-white"
                  >
                    <LayoutDashboard size={15} />
                    Mon espace — {ROLE_LABEL[currentUser.role]}
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} />
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  to="/connexion"
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-acier-900 hover:bg-slate-50"
                >
                  Connexion
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
