import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Building2, Check, FileText, Users, Settings } from 'lucide-react'

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Équipements', path: '/admin/equipment' },
  { icon: Building2, label: 'Fournisseurs', path: '/admin/fournisseurs' },
  { icon: Check, label: 'Inspections', path: '/admin/inspections' },
  { icon: FileText, label: 'Rapports', path: '/admin/reports' },
  { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
]

export default function AdminSidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-sm font-black">
          V
        </div>
        <span className="font-bold text-slate-900">VOLTA</span>
      </div>

      <nav className="space-y-1 px-3 py-6">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-yellow-100 text-yellow-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-200 px-3 py-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
          <Settings className="h-5 w-5" />
          Paramètres
        </button>
      </div>
    </aside>
  )
}
