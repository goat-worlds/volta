import { Link, NavLink, Outlet } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import type { Role } from '../store/types'
import { IconCheck, IconSearch, IconGear, IconPhone, IconEnvelope } from './Icons'
import Footer from './Footer'

const ICON_MAP: Record<string, (className: string) => JSX.Element> = {
  'Tableau de bord': ({ className }) => <IconSearch className={className} />,
  'Mes engins': ({ className }) => <IconWrench className={className} />,
  'Ajouter un engin': ({ className }) => <IconCheck className={className} />,
  'Demandes reçues': ({ className }) => <IconEnvelope className={className} />,
  'Engins': ({ className }) => <IconWrench className={className} />,
  'Inspections': ({ className }) => <IconShield className={className} />,
  'Rapports': ({ className }) => <IconCheck className={className} />,
  'Demandes': ({ className }) => <IconEnvelope className={className} />,
  'Utilisateurs': ({ className }) => <IconPhone className={className} />,
  'Missions': ({ className }) => <IconWrench className={className} />,
}

function navClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition duration-200 ${
    isActive
      ? 'bg-brand-600 text-white shadow-lg scale-105'
      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
    <aside className="flex w-72 shrink-0 flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 border-r border-slate-800/50 shadow-2xl">
      {/* Logo Section */}
      <Link to="/" className="mb-8 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/30 transition">
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} shadow-xl`}>
          <img src="/volta-logo.svg" alt="VOLTA" className="h-8 w-8" />
        </span>
        <div>
          <div className="font-bold text-white text-lg">VOLTA</div>
          <div className="text-xs text-slate-500 font-medium">{title}</div>
        </div>
      </Link>

      {/* Divider */}
      <div className="mb-6 h-px bg-gradient-to-r from-slate-800 via-slate-700 to-transparent"></div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map((l) => {
          const IconComponent = ICON_MAP[l.label] || (() => null)
          return (
            <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{l.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Notification Alert */}
      {unread > 0 && (
        <div className="mt-6 rounded-lg bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-red-500/5 border border-amber-500/40 p-4 text-sm">
          <div className="font-semibold mb-2 flex items-center gap-2 text-amber-200">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">{unread}</span>
            Notification{unread > 1 ? 's' : ''}
          </div>
          <p className="text-xs text-amber-100/80">
            Vous avez {unread} message{unread > 1 ? 's' : ''} non lu{unread > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </aside>
  )
}

export function SupplierLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar
          title="Espace Fournisseur"
          color="bg-brand-600"
          role="SUPPLIER"
          links={[
            { to: '/supplier', label: 'Tableau de bord', end: true },
            { to: '/supplier/equipment', label: 'Mes engins', end: true },
            { to: '/supplier/equipment/new', label: 'Ajouter un engin' },
            { to: '/supplier/requests', label: 'Demandes reçues' },
          ]}
        />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar
          title="Administration"
          color="bg-indigo-600"
          role="ADMIN"
          links={[
            { to: '/admin', label: 'Tableau de bord', end: true },
            { to: '/admin/equipment', label: 'Engins' },
            { to: '/admin/inspections', label: 'Inspections' },
            { to: '/admin/reports', label: 'Rapports' },
            { to: '/admin/requests', label: 'Demandes' },
            { to: '/admin/users', label: 'Utilisateurs' },
          ]}
        />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export function TechnicalLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar
          title="Équipe Technique"
          color="bg-emerald-600"
          role="TECHNICAL"
          links={[
            { to: '/technical', label: 'Tableau de bord', end: true },
            { to: '/technical/missions', label: 'Missions' },
          ]}
        />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

function publicNavClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600"><img src="/volta-logo.svg" alt="VOLTA" className="h-6 w-6" /></span>
          <span className="text-lg font-bold text-slate-900">VOLTA</span>
        </Link>
        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={publicNavClass}>Accueil</NavLink>
          <NavLink to="/catalogue" className={publicNavClass}>Équipements</NavLink>
          <NavLink to="/fournisseurs" className={publicNavClass}>Fournisseurs</NavLink>
        </nav>
        <div className="mt-6 border-t border-slate-200 pt-4 flex-1">
          <div className="space-y-3">
            {/* Supplier Portal */}
            <NavLink to="/supplier" className={({ isActive }) => `group relative flex flex-col gap-1.5 rounded-lg p-3 transition ${isActive ? 'bg-brand-50 border border-brand-200' : 'hover:bg-slate-50 border border-transparent'}`}>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                Espace Fournisseur
              </div>
              <p className="text-xs text-slate-600 leading-tight">
                Proposez vos équipements à des milliers de clients vérifiés
              </p>
            </NavLink>

            {/* Technical Portal */}
            <NavLink to="/technical" className={({ isActive }) => `group relative flex flex-col gap-1.5 rounded-lg p-3 transition ${isActive ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50 border border-transparent'}`}>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                Équipe Technique
              </div>
              <p className="text-xs text-slate-600 leading-tight">
                Inspectez et certifiez les équipements VOLTA
              </p>
            </NavLink>

            {/* Admin Portal */}
            <NavLink to="/admin" className={({ isActive }) => `group relative flex flex-col gap-1.5 rounded-lg p-3 transition ${isActive ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50 border border-transparent'}`}>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                Administration
              </div>
              <p className="text-xs text-slate-600 leading-tight">
                Gérez la plateforme et les certifications
              </p>
            </NavLink>
          </div>
        </div>

        {/* Services Promo */}
        <div className="mt-auto space-y-3">
          <div className="rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 p-4 border border-brand-200">
            <div className="font-bold text-slate-900 mb-2">VOLTA Premium</div>
            <p className="text-xs text-slate-700 leading-snug mb-3">
              Accédez à des services exclusifs: support VIP 24/7, inspection technique complète, assurance équipements
            </p>
            <a href="/pricing" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition">
              En savoir plus →
            </a>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
            <span className="font-semibold text-slate-900">Des milliers d'équipements</span> vérifiés et certifiés pour vos projets.
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600"><img src="/volta-logo.svg" alt="VOLTA" className="h-6 w-6" /></span>
              <span className="text-lg font-bold text-slate-900">VOLTA</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm font-medium">
              <NavLink to="/catalogue" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100">Équipements</NavLink>
              <NavLink to="/admin" className="rounded-lg bg-brand-600 px-3 py-2 text-white hover:bg-brand-700">Admin</NavLink>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
