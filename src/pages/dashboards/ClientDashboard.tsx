import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui'

export default function ClientDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ active: 3, pending: 2, completed: 12 })

  useEffect(() => {
    const userStr = localStorage.getItem('volta_user')
    if (!userStr) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(userStr))
  }, [navigate])

  if (!user) return <div className="flex items-center justify-center h-screen">Chargement...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Tableau de bord Client</h1>
            <p className="text-slate-400 mt-1">Bienvenue, {user.company}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('volta_user')
              navigate('/')
            }}
            className="px-4 py-2 rounded-lg text-white transition hover:bg-red-600"
            style={{ backgroundColor: '#FF8C00' }}
          >
            Déconnexion
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <div className="text-3xl font-bold mb-2">{stats.active}</div>
            <div className="text-blue-100">Locations actives</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
            <div className="text-3xl font-bold mb-2">{stats.pending}</div>
            <div className="text-purple-100">Demandes en attente</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 text-white">
            <div className="text-3xl font-bold mb-2">{stats.completed}</div>
            <div className="text-green-100">Locations complétées</div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Mes locations actives
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Pelle hydraulique CAT 320</div>
                        <div className="text-sm text-slate-400 mt-1">📍 Abidjan • Fournisseur: BTP Solutions</div>
                      </div>
                      <div className="text-right">
                        <div style={{ color: '#FF8C00' }} className="font-bold">150 000 FCFA/jour</div>
                        <div className="text-xs text-green-400 mt-1">✓ Actif</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Demandes récentes
              </h2>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Demande #000{i}</div>
                        <div className="text-sm text-slate-400 mt-1">Camion benne • 2 jours</div>
                      </div>
                      <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#FF8C00', color: 'white' }}>
                        {i === 1 ? 'En attente' : 'Approuvée'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Raccourcis rapides
              </h2>
              <div className="space-y-2">
                <button className="w-full p-3 rounded-lg text-white transition hover:scale-105 transform" style={{ backgroundColor: '#FF8C00' }}>
                  ➕ Nouvelle location
                </button>
                <button className="w-full p-3 rounded-lg bg-slate-700 text-white transition hover:bg-slate-600">
                  📋 Voir historique
                </button>
                <button className="w-full p-3 rounded-lg bg-slate-700 text-white transition hover:bg-slate-600">
                  💬 Support
                </button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Informations de compte
              </h2>
              <div className="space-y-3 text-sm text-slate-400">
                <div>
                  <div className="font-semibold text-white">Email</div>
                  <div>{user.email}</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Entreprise</div>
                  <div>{user.company}</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Rôle</div>
                  <div>👤 Client</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
