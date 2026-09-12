import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Bell, ExternalLink, Lock, LogOut, Menu, Radio, WifiOff, X } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { useShellBadges } from '../store/useShellBadges'
import { roleTheme } from '../lib/roleTheme'
import { linksFor, navigationFor, ROLE_LABEL, SPACE_LABEL, type NavItem } from '../lib/navigation'
import type { Role } from '../store/types'
import { ApiUnavailable, RouteBoundary } from '../pages/errors'

/**
 * Coque commune aux quatre espaces connectés.
 *
 * Une seule structure — barre latérale, en-tête, zone de contenu — et une
 * teinte par espace, reprise de celle que ses écrans utilisaient déjà. La
 * navigation n'est plus déclarée par chaque espace : elle est lue dans
 * l'arborescence commune, filtrée par le rôle, et groupée par section, si bien
 * qu'un technicien ne voit pas l'entrée Administration parce qu'elle ne
 * s'adresse pas à lui, pas parce qu'on l'a masquée après coup.
 *
 * L'en-tête porte l'état de la liaison avec le serveur : un point vert et
 * l'heure de la dernière synchronisation quand tout va bien, un signal de
 * panne sinon. C'est ce qui rend crédible le fait que l'écran bouge seul.
 */
export default function RoleShell({ role }: { role: Role }) {
  const { currentUser, unreadNotifications, logout, apiUnavailable, retryConnection, lastSyncAt } = useStore()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [retrying, setRetrying] = useState(false)

  // Le panneau mobile se ferme à chaque navigation, sinon la page atteinte
  // reste masquée derrière lui.
  useEffect(() => setMenuOpen(false), [location.pathname])

  const sections = useMemo(() => navigationFor(role), [role])
  const links = useMemo(() => linksFor(role), [role])
  const unread = unreadNotifications.length
  const notificationsTo = links.find((l) => l.to.endsWith('/notifications'))?.to
  const badges = useShellBadges(role)
  const theme = roleTheme(role)
  const space = SPACE_LABEL[role]

  // Le titre de la page vient du lien actif : il est déjà écrit une fois dans
  // la navigation, le redéclarer dans chaque page les ferait diverger.
  const active = [...links]
    .sort((a, b) => b.to.length - a.to.length)
    .find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)))
  const activeSection = sections.find((s) => s.items.some((i) => i === active))

  const renderItem = (l: NavItem) => {
    const badge = l.to === notificationsTo ? unread : (badges[l.to] ?? 0)
    return (
      <NavLink
        key={l.to}
        to={l.to}
        end={l.end}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
            isActive ? theme.navActive : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <l.icon size={16} className="shrink-0" />
            <span className="flex-1 truncate">{l.label}</span>
            {l.feature ? (
              // Module sans serveur : la mention le dit avant le clic.
              <span
                title="Backend requis"
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                }`}
              >
                <Lock size={9} />
                Bientôt
              </span>
            ) : (
              badge > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                    isActive ? theme.badgeOnActive : theme.badgeIdle
                  }`}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )
            )}
          </>
        )}
      </NavLink>
    )
  }

  const nav = (
    <nav className="flex flex-col gap-4">
      {sections
        .filter((s) => s.id !== 'inbox')
        .map((s) => (
          <div key={s.id}>
            {s.label && (
              <div className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {s.label}
              </div>
            )}
            <div className="flex flex-col gap-0.5">{s.items.map(renderItem)}</div>
          </div>
        ))}
    </nav>
  )

  const sidebarInner = (
    <>
      <Link to="/" className="mb-6 flex items-center gap-2.5 px-2">
        {/* Le logo garde l'ambre de la marque dans les quatre espaces : c'est
            le repère commun, l'accent ne sert qu'à situer l'espace. */}
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-btp-400 text-lg font-black text-acier-900">
          V
        </span>
        <span>
          <span className="block font-bold leading-tight text-white">VOLTA</span>
          <span className="block text-xs leading-tight text-slate-400">{space}</span>
        </span>
      </Link>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">{nav}</div>
      <div className="mt-4 space-y-1 border-t border-slate-800 pt-4">
        <Link
          to="/catalogue"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <ExternalLink size={16} className="shrink-0" />
          Voir le site public
        </Link>
        {notificationsTo && (
          <Link
            to={notificationsTo}
            className="flex items-center gap-3 rounded-lg bg-slate-800/60 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <Bell size={14} className="shrink-0" />
            {unread === 0
              ? 'Aucune notification'
              : `${unread} notification${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}`}
          </Link>
        )}
      </div>
    </>
  )

  const retry = async () => {
    setRetrying(true)
    try {
      await retryConnection()
    } finally {
      setRetrying(false)
    }
  }

  return (
    // Le fond de la zone de contenu porte une teinte très diluée : les cartes
    // blanches y ressortent, là où un gris neutre les faisait disparaître.
    <div className={`flex min-h-screen ${theme.canvas}`}>
      {/* Barre latérale fixe à partir du large ; en dessous elle devient un
          panneau que la barre du haut ouvre. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-acier-900 p-4 lg:flex">
        {sidebarInner}
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-acier-900/60" onClick={() => setMenuOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-acier-900 p-4">{sidebarInner}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Filet coloré en tête : il situe l'espace d'un coup d'œil, sans
            occuper la place qu'un bandeau plein prendrait au contenu. */}
        <div className={`sticky top-0 z-30 h-1 w-full ${theme.headerBar}`} aria-hidden />
        <header className="sticky top-1 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <span>{ROLE_LABEL[role]}</span>
              {activeSection?.label && (
                <>
                  <span aria-hidden>/</span>
                  <span>{activeSection.label}</span>
                </>
              )}
            </div>
            <div className="truncate text-sm font-semibold text-slate-900">{active?.label ?? space}</div>
          </div>

          <div className="flex items-center gap-3">
            <LiveIndicator unavailable={apiUnavailable} lastSyncAt={lastSyncAt} />

            {/* La cloche suit l'utilisateur d'un écran à l'autre : le compteur
                reste visible sans revenir à la barre latérale. */}
            {notificationsTo && (
              <Link
                to={notificationsTo}
                aria-label={
                  unread === 0 ? 'Notifications' : `Notifications, ${unread} non lue${unread > 1 ? 's' : ''}`
                }
                className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-acier-900"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span
                    className={`absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold ring-2 ring-white ${theme.badgeIdle}`}
                  >
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </Link>
            )}
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight text-slate-900">
                {currentUser?.company || currentUser?.name}
              </div>
              {currentUser?.company && (
                <div className="text-xs leading-tight text-slate-500">{currentUser.name}</div>
              )}
            </div>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${theme.avatar}`}
            >
              {(currentUser?.company || currentUser?.name || '?').charAt(0).toUpperCase()}
            </span>
            <button
              onClick={() => void logout()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 lg:p-8">
          {/* Un espace connecté sans serveur n'a rien à montrer de juste : on le
              dit en plein écran, et l'on reprend seul dès que la liaison revient.
              Le filet d'erreur entoure chaque page : une exception n'emporte
              que la zone de contenu. */}
          {apiUnavailable ? (
            <ApiUnavailable onRetry={() => void retry()} retrying={retrying} />
          ) : (
            <RouteBoundary>
              <Outlet />
            </RouteBoundary>
          )}
        </main>
      </div>
    </div>
  )
}

/**
 * État de la liaison. Le point vert dit que la dernière synchronisation a
 * abouti et quand ; le signal gris dit que le serveur ne répond plus.
 */
function LiveIndicator({ unavailable, lastSyncAt }: { unavailable: boolean; lastSyncAt: Date | null }) {
  if (unavailable) {
    return (
      <span
        title="Le serveur ne répond pas"
        className="hidden items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 md:inline-flex"
      >
        <WifiOff size={12} />
        Hors ligne
      </span>
    )
  }
  return (
    <span
      title={lastSyncAt ? `Dernière synchronisation à ${lastSyncAt.toLocaleTimeString('fr-FR')}` : 'En direct'}
      className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 md:inline-flex"
    >
      <Radio size={12} className="animate-pulse" />
      En direct
    </span>
  )
}
