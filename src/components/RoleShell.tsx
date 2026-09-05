import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Bell, ExternalLink, LogOut, Menu, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import type { Role } from '../store/types'

/**
 * Coque commune aux quatre espaces connectés.
 *
 * Chaque rôle avait auparavant sa propre barre latérale, sa propre couleur
 * d'accent et aucun en-tête : passer de l'espace fournisseur à l'espace
 * technique donnait l'impression de changer de produit, et l'utilisateur
 * connecté n'était nommé nulle part.
 *
 * Le parti pris est l'inverse : une seule coque, une seule couleur d'accent —
 * l'ambre de la marque. Ce qui distingue les espaces, c'est ce qu'ils
 * contiennent et le rôle affiché en clair, pas une teinte différente. Un
 * fournisseur qui devient aussi client retrouve exactement les mêmes repères.
 */

export interface ShellLink {
  to: string
  label: string
  icon: LucideIcon
  /** Vrai pour la racine de l'espace, qui sinon resterait active partout. */
  end?: boolean
}

const ROLE_LABEL: Record<Role, string> = {
  CLIENT: 'Client',
  SUPPLIER: 'Fournisseur',
  TECHNICAL: 'Équipe technique',
  ADMIN: 'Administration',
}

export default function RoleShell({
  role,
  space,
  links,
}: {
  role: Role
  /** Nom de l'espace, affiché sous le logo. */
  space: string
  links: ShellLink[]
}) {
  const { currentUser, notifications, logout } = useStore()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const unread = notifications.filter((n) => n.role === role && !n.read).length

  // Le titre de la page vient du lien actif : il est déjà écrit une fois dans
  // la navigation, le redéclarer dans chaque page les ferait diverger.
  const active = [...links]
    .sort((a, b) => b.to.length - a.to.length)
    .find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)))

  const nav = (
    <nav className="flex flex-col gap-1">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-amber-400 text-slate-900'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <l.icon size={16} className="shrink-0" />
          {l.label}
        </NavLink>
      ))}
    </nav>
  )

  const sidebarInner = (
    <>
      <Link to="/" className="mb-6 flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-lg font-black text-slate-900">
          V
        </span>
        <span>
          <span className="block font-bold leading-tight text-white">VOLTA</span>
          <span className="block text-xs leading-tight text-slate-400">{space}</span>
        </span>
      </Link>
      {nav}
      <div className="mt-auto space-y-1 pt-6">
        <Link
          to="/catalogue"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <ExternalLink size={16} className="shrink-0" />
          Voir le site public
        </Link>
        <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 px-3 py-2 text-xs text-slate-300">
          <Bell size={14} className="shrink-0" />
          {unread === 0 ? 'Aucune notification' : `${unread} notification${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}`}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Barre latérale fixe à partir du large ; en dessous elle devient un
          panneau que la barre du haut ouvre. */}
      <aside className="hidden w-60 shrink-0 flex-col bg-slate-900 p-4 lg:flex">{sidebarInner}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setMenuOpen(false)} />
          <aside className="relative flex w-64 flex-col bg-slate-900 p-4">{sidebarInner}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-900">{active?.label ?? space}</div>
            <div className="text-xs text-slate-500">{ROLE_LABEL[role]}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight text-slate-900">
                {currentUser?.company || currentUser?.name}
              </div>
              {currentUser?.company && (
                <div className="text-xs leading-tight text-slate-500">{currentUser.name}</div>
              )}
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-slate-900">
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
          <Outlet />
        </main>
      </div>
    </div>
  )
}
