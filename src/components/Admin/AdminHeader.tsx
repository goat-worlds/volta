import { LogOut } from 'lucide-react'
import { useStore } from '../../store/StoreContext'

export default function AdminHeader() {
  const { currentUser, logout } = useStore()

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord administrateur</h1>
          {currentUser && <p className="mt-1 text-sm text-slate-600">Bonjour, {currentUser.name}</p>}
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </header>
  )
}
