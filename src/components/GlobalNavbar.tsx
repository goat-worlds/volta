import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface User {
  email: string
  role: string
  company: string
}

export default function GlobalNavbar() {
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('volta_user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isDashboard = location.pathname.includes('dashboard') || location.pathname === '/login'
  const dashboardColor = isDashboard ? 'from-slate-900 to-slate-800' : 'from-white to-brand-50'


  const getDashboardLink = () => {
    if (!user) return '/login'
    const routes: Record<string, string> = {
      CLIENT: '/client-dashboard',
      SUPPLIER: '/supplier-dashboard',
      TECHNICAL: '/technical-dashboard',
      ADMIN: '/admin-dashboard',
    }
    return routes[user.role] || '/login'
  }

  const handleLogout = () => {
    localStorage.removeItem('volta_user')
    setUser(null)
    setShowUserMenu(false)
    window.location.href = '/'
  }

  return (
    <nav className={`sticky top-0 z-40 transition duration-300 ${isScrolled ? 'shadow-lg' : ''} bg-gradient-to-r ${dashboardColor}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg font-bold text-white">
            <img src="/volta-logo.svg" alt="VOLTA" className="w-8 h-8" />
          </div>
          <div>
            <div className={`font-bold text-lg ${isDashboard ? 'text-white' : 'text-brand-700'}`}>VOLTA</div>
            <div className={`text-xs ${isDashboard ? 'text-slate-400' : 'text-slate-700'}`}>Équipements</div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {!isDashboard && (
            <>
              <Link
                to="/"
                className={`font-medium transition hover:opacity-70 ${
                  location.pathname === '/' ? 'text-brand-600 font-bold' : 'text-slate-700'
                }`}
              >
                Accueil
              </Link>
              <Link
                to="/catalogue"
                className={`font-medium transition hover:opacity-70 ${
                  location.pathname === '/catalogue' ? 'text-brand-600 font-bold' : 'text-slate-700'
                }`}
              >
                Catalogue
              </Link>
              <Link
                to="/fournisseurs"
                className={`font-medium transition hover:opacity-70 ${
                  location.pathname === '/fournisseurs' ? 'text-brand-600 font-bold' : 'text-slate-700'
                }`}
              >
                Fournisseurs
              </Link>
            </>
          )}
        </div>

        {/* Right Side - User Menu or Login */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {!isDashboard && (
                <Link
                  to={getDashboardLink()}
                  className="hidden sm:inline-block px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90 bg-brand-600 hover:bg-brand-700"
                >
                  Mon Espace
                </Link>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-70 font-medium ${
                    isDashboard ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  <span>{user.company}</span>
                  <span className="text-xs">▼</span>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-slate-200 animate-in fade-in scale-in-95 duration-200 z-50">
                    <div className="p-4 border-b border-slate-200">
                      <div className="font-semibold text-slate-900">{user.company}</div>
                      <div className="text-xs text-slate-600 mt-1">{user.email}</div>
                      <div className="text-xs font-medium text-brand-600 mt-2 uppercase tracking-wide">
                        {user.role === 'CLIENT' && 'Client'}
                        {user.role === 'SUPPLIER' && 'Fournisseur'}
                        {user.role === 'TECHNICAL' && 'Équipe Technique'}
                        {user.role === 'ADMIN' && 'Administrateur'}
                      </div>
                    </div>

                    <div className="p-3 space-y-1">
                      {!isDashboard && (
                        <Link
                          to={getDashboardLink()}
                          className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-slate-100 transition text-sm font-medium text-slate-900"
                        >
                          Tableau de bord
                        </Link>
                      )}
                      {isDashboard && (
                        <Link
                          to="/"
                          className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-slate-100 transition text-sm font-medium text-slate-900"
                        >
                          Retour au site
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          handleLogout()
                        }}
                        className="block w-full text-left px-4 py-2.5 rounded-lg hover:bg-red-50 transition text-sm font-medium text-red-600 border-t border-slate-200 pt-3 mt-1"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90 bg-brand-600 hover:bg-brand-700"
              >
                Connexion
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
