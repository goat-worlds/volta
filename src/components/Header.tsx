import { Link, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useStore } from '../store/StoreContext'

export default function Header() {
  const { currentUser, logout } = useStore()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400 text-lg font-black">
              V
            </div>
            <span className="text-xl">VOLTA</span>
          </Link>

          {!currentUser ? (
            <nav className="flex gap-8">
              <Link
                to="/"
                className={`text-sm font-medium transition ${
                  isActive('/') ? 'text-yellow-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Accueil
              </Link>
              <Link
                to="/catalogue"
                className={`text-sm font-medium transition ${
                  isActive('/catalogue') ? 'text-yellow-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Équipements
              </Link>
              <Link
                to="/fournisseurs"
                className={`text-sm font-medium transition ${
                  isActive('/fournisseurs') ? 'text-yellow-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fournisseurs
              </Link>
            </nav>
          ) : null}

          <div className="flex items-center gap-4">
            {currentUser && (
              <>
                <span className="text-sm font-medium text-slate-700">{currentUser.name}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </>
            )}
            {!currentUser && (
              <Link
                to="/connexion"
                className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-yellow-500"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
