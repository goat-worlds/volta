import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  Bug,
  Settings,
  Users,
  Building2,
  CreditCard,
  ScrollText,
  Activity,
  ShieldCheck,
  LogOut,
  Server,
  FileText,
  Plus,
  CheckCircle,
  Zap,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react'
import { Logo } from '../components/marketing/Logo'

export type Role = 'auditeur' | 'admin' | 'rssi'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const navs: Record<Role, NavItem[]> = {
  auditeur: [
    { to: '/app/auditeur', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/app/auditeur/missions', label: 'Missions audit', icon: ClipboardList },
    { to: '/app/auditeur/nouvelle-mission', label: 'Nouvelle mission', icon: Plus },
    { to: '/app/auditeur/vulnerabilites', label: 'Vulnerabilites', icon: Bug },
    { to: '/app/auditeur/agents', label: 'Agents IA', icon: Server },
    { to: '/app/auditeur/parametres', label: 'Parametres', icon: Settings },
  ],
  admin: [
    { to: '/app/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/app/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { to: '/app/admin/organisations', label: 'Organisations', icon: Building2 },
    { to: '/app/admin/audits', label: 'Gestion Audits', icon: CheckCircle },
    { to: '/app/admin/abonnements', label: 'Abonnements', icon: CreditCard },
    { to: '/app/admin/logs', label: 'Journaux', icon: ScrollText },
    { to: '/app/admin/parametres', label: 'Parametres', icon: Settings },
  ],
  rssi: [
    { to: '/app/rssi', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/app/rssi/risques', label: 'Risques', icon: AlertTriangle },
    { to: '/app/rssi/vulnerabilites', label: 'Vulnerabilites', icon: Bug },
    { to: '/app/rssi/missions', label: 'Audits & Missions', icon: ClipboardList },
    { to: '/app/rssi/assets', label: 'Gestion Actifs', icon: Server },
    { to: '/app/rssi/agents', label: 'Agents IA', icon: Zap },
    { to: '/app/rssi/rapports', label: 'Rapports', icon: FileText },
    { to: '/app/rssi/auditeurs', label: 'Auditeurs', icon: Users },
    { to: '/app/rssi/abonnement', label: 'Abonnement', icon: CreditCard },
    { to: '/app/rssi/parametres', label: 'Parametres', icon: Settings },
  ],
}

const spaceLabels: Record<Role, string> = {
  auditeur: 'ESPACE AUDITEUR',
  admin: 'ESPACE ADMIN',
  rssi: 'ESPACE RSSI',
}

export function AppLayout({ role }: { role: Role }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const dark = role === 'rssi'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getPlanColor = (plan?: string): string => {
    if (!plan) return 'text-gray-400'
    if (plan.toLowerCase().includes('enterprise')) return 'text-purple-400'
    if (plan.toLowerCase().includes('pro')) return 'text-blue-400'
    return 'text-green-400'
  }

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-bg-dark text-text-on-dark' : 'bg-surface-light text-text-on-light'}`}>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop + Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 flex-col border-r transition-transform duration-300 ${
          dark ? 'border-border-dark bg-surface-dark' : 'border-slate-200 bg-white'
        } ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } hidden md:flex md:translate-x-0`}
      >
        <div className={`border-b px-4 py-4 ${dark ? 'border-border-dark' : 'border-slate-200'}`}>
          <Link to="/">
            <Logo light={!dark} />
          </Link>
        </div>
        <p className={`px-4 pb-1 pt-4 text-[10px] font-bold tracking-widest ${dark ? 'text-text-on-dark-muted' : 'text-slate-400'}`}>
          {spaceLabels[role]}
        </p>
        <nav className="flex-1 space-y-0.5 px-2 overflow-y-auto" aria-label="Navigation">
          {navs[role].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand text-white'
                    : dark
                      ? 'text-text-on-dark-muted hover:bg-bg-dark hover:text-white'
                      : 'text-slate-600 hover:bg-surface-light hover:text-text-on-light'
                }`
              }
            >
              <item.icon size={17} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={`border-t space-y-4 p-4 ${dark ? 'border-border-dark' : 'border-slate-200'}`}>
          {user?.subscription && (
            <div className={`rounded-lg border p-3 ${dark ? 'border-border-dark bg-bg-dark/50' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-xs font-semibold uppercase tracking-widest ${dark ? 'text-text-on-dark-muted' : 'text-slate-500'}`}>
                Plan
              </p>
              <p className={`text-sm font-bold ${getPlanColor(user.subscription.plan)}`}>
                {user.subscription.plan}
              </p>
              <p className={`text-xs ${dark ? 'text-text-on-dark-muted' : 'text-slate-600'}`}>
                {user.subscription.price}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              {user?.name[0]?.toUpperCase()}
            </span>
            <span className="flex-1">
              <span className={`block text-sm font-semibold ${dark ? 'text-white' : 'text-text-on-light'}`}>
                {user?.name || 'Utilisateur'}
              </span>
              <span className={`block text-xs ${dark ? 'text-text-on-dark-muted' : 'text-slate-500'}`}>
                {role === 'admin' ? 'Super Admin' : role === 'rssi' ? 'RSSI' : 'Auditeur'}
              </span>
            </span>
            <button onClick={handleLogout} aria-label="Logout" className={dark ? 'text-text-on-dark-muted hover:text-white' : 'text-slate-400 hover:text-slate-700'}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 md:ml-60">
        <header
          className={`sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 backdrop-blur sm:px-6 ${
            dark ? 'border-border-dark bg-bg-dark/90' : 'border-slate-200 bg-white/90'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-brand transition"
              aria-label={mobileMenuOpen ? 'Fermer menu' : 'Ouvrir menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <Link to="/">
                <ShieldCheck size={22} className="text-brand" />
              </Link>
              <span className="text-sm font-bold">{spaceLabels[role]}</span>
            </div>
          </div>
          <div className="hidden text-sm md:block flex-1">
            <span className={dark ? 'text-text-on-dark-muted' : 'text-slate-500'}>CYBERAS Intelligence v2.4.0</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition ${
                dark ? 'hover:bg-surface-dark text-text-on-dark-muted hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Activity size={16} className="text-brand" />
            <span className={`text-xs ${dark ? 'text-text-on-dark-muted' : 'text-slate-500'}`}>11 aug 2026</span>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
