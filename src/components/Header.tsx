import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, Phone, Search, X } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { HOME_BY_ROLE, ROLE_LABEL } from '../lib/navigation'
import { PRIMARY_LINKS, SECONDARY_LINKS, TELEPHONE } from '../lib/siteNav'
import InstallAppButton from './site/InstallAppButton'
import Logo from './Logo'

/**
 * En-tête public.
 *
 * Sombre, comme le bandeau d'accueil qu'il surplombe : la barre blanche
 * coupait la page en deux à l'arrivée. Elle porte les entrées principales et,
 * à droite, le suivi de demande et les accès au compte.
 *
 * Un menu « Parcours » y dépliait les huit intentions. Il faisait double emploi
 * avec l'accueil, qui les présente en grand dès l'arrivée et retient la page
 * jusqu'à ce qu'on en choisisse une : la barre proposait en petit, derrière un
 * survol, ce que la page offrait déjà en pleine largeur.
 */
export default function Header() {
  const { currentUser, logout } = useStore()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  // Un menu resté ouvert masquerait la page vers laquelle on vient d'aller.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const space = currentUser ? HOME_BY_ROLE[currentUser.role] : null
  // `whitespace-nowrap` : sans lui, une barre trop chargée coupe les intitulés
  // en plein milieu — « Louer un / engin » sur trois lignes — au lieu de laisser
  // le dépassement se voir et se corriger.
  const linkClass = (active: boolean) =>
    `whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold transition ${
      active ? 'bg-white/10 text-white' : 'text-acier-200 hover:bg-white/5 hover:text-white'
    }`

  return (
    <header
      className="sticky top-0 z-50 bg-acier-900 shadow-lg shadow-acier-900/20"
    >
      <div className="btp-hazard-stripe h-1 w-full" aria-hidden />

      {/* Pleine largeur, et non centrée sur 1280 px : la marque appartient au
          bord de l'écran. Dans un conteneur centré, elle flottait au milieu
          d'une marge vide dès que la fenêtre dépassait la largeur maximale. */}
      <div className="flex h-[60px] w-full items-center gap-3 pl-4 pr-4 sm:pl-5">
        <Link to="/" aria-label="Accueil VOLTA" className="shrink-0">
          <Logo />
        </Link>

        {/* Les entrées se centrent dans l'espace laissé entre la marque et les
            actions. Le logo garde le bord gauche — c'est lui qui ancre la barre
            — mais les mots, eux, se lisent mieux groupés au milieu qu'alignés
            contre la marque. */}
        <nav
          className="hidden flex-1 items-center justify-center gap-0.5 lg:flex"
          aria-label="Navigation principale"
        >
          {PRIMARY_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => linkClass(isActive)}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-1.5 whitespace-nowrap lg:flex">
          {/* Le numero en clair dans la barre : sur un chantier, on
              appelle avant de remplir un formulaire. Il est lu depuis
              siteNav, comme celui du pied de page. */}
          {/* Le numéro n'est plus encadré. Trois cadres côte à côte — numéro,
              connexion, inscription — se disputaient le regard et alourdissaient
              la barre ; seul le geste qu'on veut provoquer garde un fond plein. */}
          <a
            href={TELEPHONE.lien}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-sm font-bold text-white transition hover:text-btp-300"
          >
            <Phone size={15} className="text-btp-400" aria-hidden />
            {TELEPHONE.affiche}
          </a>
          {/* Le suivi n'apparaît qu'à partir de `2xl` : c'est l'entrée la moins
              demandée de la barre, et à 1280 px elle faisait déborder « Créer un
              compte » hors de l'écran. Elle reste dans le menu mobile et en pied
              de page, où personne ne la cherche en vain. */}
          {SECONDARY_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `hidden items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition 2xl:inline-flex ${
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
                className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold text-acier-200 transition hover:text-white"
              >
                Connexion
              </Link>
              <Link
                to="/inscription"
                className="whitespace-nowrap rounded-lg bg-btp-500 px-3.5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-btp-600"
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
