import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [stats] = useState({ users: 156, equipment: 489, transactions: 2340, revenue: 45600000 })

  useEffect(() => {
    const userStr = localStorage.getItem('volta_user')
    if (!userStr) navigate('/login')
    else setUser(JSON.parse(userStr))
  }, [navigate])

  if (!user) return <div className="flex items-center justify-center h-screen">Chargement...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Administration VOLTA</h1>
            <p className="text-slate-400 mt-1">Contrôle et statistiques plateform</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <div className="text-3xl font-bold mb-2">{stats.users}</div>
            <div className="text-blue-100">Utilisateurs</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
            <div className="text-3xl font-bold mb-2">{stats.equipment}</div>
            <div className="text-purple-100">Équipements</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
            <div className="text-3xl font-bold mb-2">{stats.transactions}</div>
            <div className="text-orange-100">Transactions</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 text-white">
            <div className="text-3xl font-bold mb-2">{(stats.revenue / 1000000).toFixed(1)}M</div>
            <div className="text-green-100">Revenus (FCFA)</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Gestion des utilisateurs
              </h2>
              <div className="space-y-3">
                {[
                  { type: 'Clients', count: 87, icon: '👤' },
                  { type: 'Fournisseurs', count: 34, icon: '🏭' },
                  { type: 'Techniciens', count: 12, icon: '🔧' },
                  { type: 'Admin', count: 3, icon: '👨‍💼' },
                ].map((item) => (
                  <div key={item.type} className="p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-semibold text-white">{item.type}</div>
                          <div className="text-xs text-slate-400">{item.count} utilisateurs actifs</div>
                        </div>
                      </div>
                      <button className="px-3 py-1 rounded text-white text-sm font-bold hover:scale-105" style={{ backgroundColor: '#FF8C00' }}>
                        Gérer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Transactions récentes
              </h2>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Paiement #{i}000{i}</div>
                        <div className="text-sm text-slate-400 mt-1">Client: Acme • Montant: {25000000 * i} FCFA</div>
                      </div>
                      <div className="text-right">
                        <div style={{ color: '#FF8C00' }} className="font-bold">{25000000 * i / 1000000}M FCFA</div>
                        <div className="text-xs text-green-400 mt-1">✓ Complété</div>
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
                Actions d'administration
              </h2>
              <div className="space-y-2">
                <button className="w-full p-3 rounded-lg text-white transition hover:scale-105 transform" style={{ backgroundColor: '#FF8C00' }}>
                  👤 Gérer utilisateurs
                </button>
                <button className="w-full p-3 rounded-lg bg-slate-700 text-white transition hover:bg-slate-600">
                  🚜 Gérer équipements
                </button>
                <button className="w-full p-3 rounded-lg bg-slate-700 text-white transition hover:bg-slate-600">
                  💰 Rapports financiers
                </button>
                <button className="w-full p-3 rounded-lg bg-slate-700 text-white transition hover:bg-slate-600">
                  📊 Statistiques
                </button>
                <button className="w-full p-3 rounded-lg bg-slate-700 text-white transition hover:bg-slate-600">
                  ⚙️ Paramètres
                </button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Alertes système
              </h2>
              <div className="space-y-2 text-sm">
                <div className="p-2 rounded bg-red-900/30 text-red-200 border border-red-500/30">
                  🔴 2 inspections en retard
                </div>
                <div className="p-2 rounded bg-yellow-900/30 text-yellow-200 border border-yellow-500/30">
                  🟡 5 paiements en attente
                </div>
                <div className="p-2 rounded bg-green-900/30 text-green-200 border border-green-500/30">
                  🟢 Système opérationnel
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
