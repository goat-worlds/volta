import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'equipment' | 'reports' | 'stats' | 'settings'>('users')
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">👨‍💼 Administration VOLTA</h1>
          <p className="text-slate-400 mt-1">Contrôle et statistiques plateforme</p>
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
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full p-3 rounded-lg transition ${activeTab === 'users' ? 'text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  style={{ backgroundColor: activeTab === 'users' ? '#FF8C00' : undefined }}
                >
                  👤 Gérer utilisateurs
                </button>
                <button
                  onClick={() => setActiveTab('equipment')}
                  className={`w-full p-3 rounded-lg transition ${activeTab === 'equipment' ? 'text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  style={{ backgroundColor: activeTab === 'equipment' ? '#FF8C00' : undefined }}
                >
                  🚜 Gérer équipements
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full p-3 rounded-lg transition ${activeTab === 'reports' ? 'text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  style={{ backgroundColor: activeTab === 'reports' ? '#FF8C00' : undefined }}
                >
                  💰 Rapports financiers
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full p-3 rounded-lg transition ${activeTab === 'stats' ? 'text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  style={{ backgroundColor: activeTab === 'stats' ? '#FF8C00' : undefined }}
                >
                  📊 Statistiques
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full p-3 rounded-lg transition ${activeTab === 'settings' ? 'text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  style={{ backgroundColor: activeTab === 'settings' ? '#FF8C00' : undefined }}
                >
                  ⚙️ Paramètres
                </button>
              </div>
            </Card>

            <Card className="p-6 mb-6">
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

            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                🌐 Site Vitrine
              </h2>
              <div className="space-y-2">
                <a href="/" className="block p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition text-center font-medium">
                  🏠 Accueil
                </a>
                <a href="/catalogue" className="block p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition text-center font-medium">
                  🚜 Catalogue
                </a>
                <a href="/fournisseurs" className="block p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition text-center font-medium">
                  🏢 Fournisseurs
                </a>
              </div>
            </Card>
          </div>
        </div>

        {/* Utilisateurs Section */}
        {activeTab === 'users' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ color: '#FF8C00' }}>
                👤 Gestion des utilisateurs
              </h2>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Utilisateur #{100 + i}</div>
                        <div className="text-sm text-slate-400 mt-1">user{i}@volta.ci • Rôle: {['Client', 'Supplier', 'Technical', 'Admin'][i - 1]}</div>
                        <div className="text-xs text-green-400 mt-2">✓ Actif</div>
                      </div>
                      <button className="px-4 py-2 rounded-lg text-white transition hover:scale-105" style={{ backgroundColor: '#FF8C00' }}>
                        ⚙️ Gérer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Équipements Section */}
        {activeTab === 'equipment' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ color: '#FF8C00' }}>
                🚜 Gestion des équipements
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Équipement #{5000 + i}</div>
                        <div className="text-sm text-slate-400 mt-1">Pelle • BTP Solutions • {150000 * i} FCFA/jour</div>
                        <div className="text-xs text-green-400 mt-2">✓ Approuvé</div>
                      </div>
                      <button className="px-4 py-2 rounded-lg text-white transition hover:scale-105" style={{ backgroundColor: '#FF8C00' }}>
                        👁️ Voir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Rapports Financiers Section */}
        {activeTab === 'reports' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ color: '#FF8C00' }}>
                💰 Rapports financiers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Revenus ce mois</div>
                  <div className="text-2xl font-bold text-white">45.6M FCFA</div>
                  <div className="text-xs text-green-400 mt-2">↑ 8% vs mois précédent</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Commissions prélevées</div>
                  <div className="text-2xl font-bold text-white">4.56M FCFA</div>
                  <div className="text-xs text-slate-400 mt-2">10% du total</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Paiements effectués</div>
                  <div className="text-2xl font-bold text-white">41.04M FCFA</div>
                  <div className="text-xs text-green-400 mt-2">Aux fournisseurs</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Solde en attente</div>
                  <div className="text-2xl font-bold text-white">1.2M FCFA</div>
                  <div className="text-xs text-yellow-400 mt-2">Vérification en cours</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Statistiques Section */}
        {activeTab === 'stats' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ color: '#FF8C00' }}>
                📊 Statistiques globales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Taux d'utilisation</div>
                  <div className="text-3xl font-bold text-white mb-2">82%</div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Satisfaction client</div>
                  <div className="text-3xl font-bold text-white">4.7/5</div>
                  <div className="text-xs text-slate-400 mt-2">Basé sur 234 avis</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Paramètres Section */}
        {activeTab === 'settings' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ color: '#FF8C00' }}>
                ⚙️ Paramètres
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Commission plateforme</div>
                      <div className="text-sm text-slate-400 mt-1">Taux appliqué aux fournisseurs</div>
                    </div>
                    <input type="text" value="10%" className="px-4 py-2 rounded-lg bg-slate-600 text-white w-24 text-center border border-slate-500" readOnly />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Temps de réponse max</div>
                      <div className="text-sm text-slate-400 mt-1">Pour les demandes de remplacement</div>
                    </div>
                    <input type="text" value="24h" className="px-4 py-2 rounded-lg bg-slate-600 text-white w-24 text-center border border-slate-500" readOnly />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Mode maintenance</div>
                      <div className="text-sm text-slate-400 mt-1">Désactiver la plateforme temporairement</div>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-white transition hover:scale-105" style={{ backgroundColor: '#FF8C00' }}>
                      Désactivé
                    </button>
                  </div>
                </div>

                <button className="w-full py-2.5 rounded-lg text-white font-bold transition hover:scale-105 active:scale-95" style={{ backgroundColor: '#FF8C00' }}>
                  💾 Sauvegarder les paramètres
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
