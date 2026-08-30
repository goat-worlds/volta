import { Link, NavLink, Outlet } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import type { Role } from '../store/types'

function navClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`
}

function Sidebar({
  title,
  color,
  links,
  role,
}: {
  title: string
  color: string
  links: { to: string; label: string; end?: boolean }[]
  role: Role
}) {
  const { notifications } = useStore()
  const unread = notifications.filter((n) => n.role === role && !n.read).length
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-slate-900 p-4">
      <Link to="/" className="mb-6 flex items-center gap-2 px-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${color} font-bold text-white`}>V</span>
        <div>
          <div className="font-bold text-white">VOLTA</div>
          <div className="text-xs text-slate-400">{title}</div>
        </div>
      </Link>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-lg bg-slate-800 p-3 text-xs text-slate-300">
        🔔 {unread} notification{unread > 1 ? 's' : ''} non lue{unread > 1 ? 's' : ''}
      </div>
    </aside>
  )
}

export function SupplierLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        title="Espace Fournisseur"
        color="bg-blue-600"
        role="SUPPLIER"
        links={[
          { to: '/supplier', label: '📊 Tableau de bord', end: true },
          { to: '/supplier/equipment', label: '🚜 Mes engins', end: true },
          { to: '/supplier/equipment/new', label: '➕ Ajouter un engin' },
          { to: '/supplier/requests', label: '📩 Demandes reçues' },
        ]}
      />
      <main className="flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        title="Administration"
        color="bg-indigo-600"
        role="ADMIN"
        links={[
          { to: '/admin', label: '📊 Tableau de bord', end: true },
          { to: '/admin/equipment', label: '🚜 Engins' },
          { to: '/admin/inspections', label: '🔍 Inspections' },
          { to: '/admin/reports', label: '📄 Rapports' },
          { to: '/admin/requests', label: '📩 Demandes' },
          { to: '/admin/users', label: '👥 Utilisateurs' },
        ]}
      />
      <main className="flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export function TechnicalLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        title="Équipe Technique"
        color="bg-emerald-600"
        role="TECHNICAL"
        links={[
          { to: '/technical', label: '📊 Tableau de bord', end: true },
          { to: '/technical/missions', label: '🧰 Missions' },
        ]}
      />
      <main className="flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

function publicNavClass({ isActive }: { isActive: boolean }) {
  return `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'text-slate-900 underline decoration-yellow-400 decoration-2 underline-offset-8' : 'text-slate-600 hover:text-slate-900'
  }`
}

export function PublicLayout() {
  const { currentUser, logout } = useStore()
  const spaceLink =
    currentUser?.role === 'ADMIN'
      ? '/admin'
      : currentUser?.role === 'SUPPLIER'
        ? '/supplier'
        : currentUser?.role === 'TECHNICAL'
          ? '/technical'
          : '/catalogue'
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400 font-black text-slate-900">V</span>
            <span className="text-xl font-black tracking-tight text-slate-900">VOLTA</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={publicNavClass}>Accueil</NavLink>
            <NavLink to="/catalogue" className={publicNavClass}>Équipements</NavLink>
            <NavLink to="/fournisseurs" className={publicNavClass}>Fournisseurs</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                <Link to={spaceLink} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  {currentUser.name}
                </Link>
                <button
                  onClick={() => void logout()}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Se connecter
                </Link>
                <Link
                  to="/inscription"
                  className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-yellow-500"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-slate-200 bg-slate-900 py-10 text-center text-sm text-slate-400">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 font-black text-slate-900">V</span>
            <span className="text-lg font-black text-white">VOLTA</span>
          </div>
          <p>Référencer → Vérifier → Décider → Publier → Rechercher → Mettre en relation</p>
          <p className="mt-2">© 2026 VOLTA — Équipements de chantier vérifiés en Côte d'Ivoire</p>
        </div>
      </footer>
    </div>
  )
}
