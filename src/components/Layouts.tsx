import { Link, NavLink, Outlet } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import type { Role } from '../store/types'
import Header from './Header'
import Footer from './Footer'

function navClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
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

