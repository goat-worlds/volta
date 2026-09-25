import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, ChevronDown, LayoutDashboard, LogOut, Menu, Search, X } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { HOME_BY_ROLE, ROLE_LABEL } from '../lib/navigation'
import { JOURNEYS_FEATURE, JOURNEY_COLUMNS, PRIMARY_LINKS, SECONDARY_LINKS } from '../lib/siteNav'
import InstallAppButton from './site/InstallAppButton'

/**
 * En-tête public.
 *
 * Sombre, comme le bandeau d'accueil qu'il surplombe : la barre blanche
 * coupait la page en deux à l'arrivée. Elle porte les quatre entrées
 * principales, un panneau « Parcours » qui déplie les huit intentions par
 * public — avec un encart qui dit le principe avant la liste — et, à droite,
 * le suivi de demande et les accès au compte.
 *
 * Le panneau s'ouvre au survol et au clic, se ferme à la sortie après un court
 * délai (le pointeur traverse un vide entre le bouton et le panneau), à la
 * touche Échap, et à chaque navigation.
 */
export default function Header() {
  const { currentUser, logout } = useStore()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setPanelOpen(false), 200)
  }
  const openPanel = () => {
    cancelClose()
    setPanelOpen(true)
  }

  // Un menu resté ouvert masquerait la page vers laquelle on vient d'aller.
  useEffect(() => {
    setMenuOpen(false)
    setPanelOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => cancelClose, [])

  useEffect(() => {
    if (!panelOpen && !menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanelOpen(false)
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen, menuOpen])

  const space = currentUser ? HOME_BY_ROLE[currentUser.role] : null
  const journeysActive = location.pathname.startsWith('/demande') || location.pathname === '/gold'

  const linkClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      active ? 'bg-white/10 text-white' : 'text-acier-200 hover:bg-white/5 hover:text-white'
    }`

  return (
    <header
      className="sticky top-0 z-50 bg-acier-900 shadow-lg shadow-acier-900/20"
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      <div className="btp-hazard-stripe h-1 w-full" aria-hidden />

      <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Accueil VOLTA">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-btp-500 text-lg font-black text-acier-900">
            V
          </span>
          <span className="leading-none">
            <span className="block text-lg font-black tracking-tight text-white">VOLTA</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-acier-300">
              <span className="lowercase">by</span> Génie Sélect Digital
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex" aria-label="Navigation principale">
          <div className="relative" onMouseEnter={openPanel}>
            <button
              type="button"
              aria-expanded={panelOpen}
              aria-haspopup="true"
              onClick={() => setPanelOpen((o) => !o)}
              className={`flex items-center gap-1 ${linkClass(panelOpen || journeysActive)}`}
            >
              Parcours
              <ChevronDown size={14} className={`transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {PRIMARY_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => linkClass(isActive)}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {SECONDARY_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'text-white' : 'text-acier-300 hover:text-white'
                }`
              }
            >
              <Search size={14} />
              {l.label}
            </NavLink>
          ))}

          {currentUser && space ? (
            <>
              <Link
                to={space}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-sm font-semibold text-white transition hover:border-btp-400 hover:bg-white/5"
              >
                <LayoutDashboard size={15} />
                Mon espace
                <span className="hidden text-xs font-normal text-acier-300 xl:inline">· {ROLE_LABEL[currentUser.role]}</span>
              </Link>
              <button
                onClick={() => logout()}
                aria-label="Déconnexion"
                className="rounded-lg p-2 text-acier-300 transition hover:bg-white/5 hover:text-red-400"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/connexion"
                className="rounded-lg border border-white/15 px-3.5 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              >
                Connexion
              </Link>
              <Link
                to="/inscription"
                className="rounded-lg bg-btp-500 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-btp-600"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          className="ml-auto rounded-lg p-2 text-white transition hover:bg-white/10 lg:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Panneau « Parcours », pleine largeur sous la barre. */}
      {panelOpen && (
        <div
          className="absolute inset-x-0 top-full z-40 hidden border-t border-white/10 bg-acier-900/98 shadow-2xl backdrop-blur lg:block"
          onMouseEnter={openPanel}
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_2.6fr]">
            <div className="rounded-xl border border-white/10 bg-acier-800/60 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-btp-400">{JOURNEYS_FEATURE.eyebrow}</p>
              <h3 className="mt-3 text-lg font-bold leading-snug text-white">{JOURNEYS_FEATURE.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-acier-200">{JOURNEYS_FEATURE.description}</p>
              <Link
                to={JOURNEYS_FEATURE.to}
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-btp-400"
              >
                {JOURNEYS_FEATURE.ctaLabel}
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid gap-x-6 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
              {JOURNEY_COLUMNS.map((column) => (
                <div key={column.heading}>
                  <p className="border-b border-btp-500/40 pb-2 text-xs font-bold uppercase tracking-wider text-btp-300">
                    {column.heading}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {column.intents.map((intent) => (
                      <li key={intent.id}>
                        <Link
                          to={intent.to}
                          className="group flex gap-3 rounded-lg p-2 transition hover:bg-white/5"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-btp-500/15 text-btp-400 transition group-hover:bg-btp-500 group-hover:text-white">
                            <intent.icon size={16} />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-white">{intent.title}</span>
                            <span className="mt-0.5 block text-xs leading-snug text-acier-300">{intent.cta}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu mobile : mêmes entrées, à plat. */}
      {menuOpen && (
        <nav className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-white/10 bg-acier-900 lg:hidden" aria-label="Navigation mobile">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {PRIMARY_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    isActive ? 'bg-white/10 text-white' : 'text-acier-200 hover:bg-white/5'
                  }`
                }
              >
                {l.icon && <l.icon size={16} className="text-btp-400" />}
                <span>
                  {l.label}
                  {l.description && <span className="block text-xs font-normal text-acier-400">{l.description}</span>}
                </span>
              </NavLink>
            ))}

            <p className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-btp-300">Parcours</p>
            {JOURNEY_COLUMNS.flatMap((c) => c.intents).map((intent) => (
              <Link
                key={intent.id}
                to={intent.to}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-acier-200 hover:bg-white/5"
              >
                <intent.icon size={15} className="text-btp-400" />
                {intent.title}
              </Link>
            ))}

            <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
              {SECONDARY_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-acier-200 hover:bg-white/5">
                  {l.label}
                </Link>
              ))}
              {currentUser && space ? (
                <>
                  <Link to={space} className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2.5 text-sm font-semibold text-white">
                    <LayoutDashboard size={15} />
                    Mon espace — {ROLE_LABEL[currentUser.role]}
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-400 hover:bg-white/5"
                  >
                    <LogOut size={15} />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/connexion" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/5">
                    Connexion
                  </Link>
                  <Link to="/inscription" className="block rounded-lg bg-btp-500 px-3 py-2.5 text-center text-sm font-bold text-white">
                    Créer un compte
                  </Link>
                </>
              )}

              {/* Le geste se fait sur téléphone : c'est là qu'on le propose. */}
              <InstallAppButton tone="dark" className="mt-2 w-full" />
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
