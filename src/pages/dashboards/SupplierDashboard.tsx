import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui'

export default function SupplierDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stats' | 'payments'>('dashboard')
  const [showNewModal, setShowNewModal] = useState(false)
  const [stats] = useState({ active: 8, inquiries: 5, revenue: 2400000 })

  useEffect(() => {
    const userStr = localStorage.getItem('volta_user')
    if (!userStr) navigate('/login')
    else setUser(JSON.parse(userStr))
  }, [navigate])

  if (!user) return <div className="flex items-center justify-center h-screen">Chargement...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">🏭 Tableau de bord Fournisseur</h1>
          <p className="text-slate-600 mt-1">{user.company}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <div className="text-3xl font-bold mb-2">{stats.active}</div>
            <div className="text-blue-100">Équipements actifs</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
            <div className="text-3xl font-bold mb-2">{stats.inquiries}</div>
            <div className="text-orange-100">Demandes reçues</div>
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
                Mes équipements
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Bulldozer CAT D6T #{i}</div>
                        <div className="text-sm text-slate-600 mt-1">État: Excellent • 2500h</div>
                      </div>
                      <div className="text-right">
                        <div style={{ color: '#FF8C00' }} className="font-bold">200 000 FCFA/jour</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Demandes en attente
              </h2>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Demande de {i === 1 ? 'Acme' : 'BTP'} Corp</div>
                        <div className="text-sm text-slate-600 mt-1">Pelle • 5 jours • {25000000 * i} FCFA</div>
                      </div>
                      <button style={{ backgroundColor: '#FF8C00' }} className="px-3 py-1 rounded text-white text-sm font-bold hover:opacity-90">
                        Répondre
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setShowNewModal(true)}
                  className="w-full p-3 rounded-lg text-white transition hover:scale-105 transform"
                  style={{ backgroundColor: '#FF8C00' }}
                >
                  ➕ Ajouter équipement
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full p-3 rounded-lg transition ${activeTab === 'stats' ? 'text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  style={{ backgroundColor: activeTab === 'stats' ? '#FF8C00' : undefined }}
                >
                  📊 Statistiques
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`w-full p-3 rounded-lg transition ${activeTab === 'payments' ? 'text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  style={{ backgroundColor: activeTab === 'payments' ? '#FF8C00' : undefined }}
                >
                  💰 Paiements
                </button>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Certifications
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <span>✓</span> Mécanicien qualifié
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <span>✓</span> Remplacement 24h
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <span>✓</span> Entrepôt équipé
                </div>
              </div>
            </Card>

            {/* VOLTA Growth Tools */}
            <Card className="p-6 bg-gradient-to-br from-blue-600/10 to-blue-500/10 border border-blue-300/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                <span style={{ color: '#FF8C00' }}>Augmentez vos Ventes</span>
              </h2>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition">
                  <div className="font-semibold text-white mb-1">💼 Clients Vérifiés</div>
                  <p className="text-sm text-slate-400">Accédez à des milliers de clients fiables</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition">
                  <div className="font-semibold text-white mb-1">💰 Paiements Sécurisés</div>
                  <p className="text-sm text-slate-400">Versements rapides via système escrow</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition">
                  <div className="font-semibold text-white mb-1">🏆 Certification Premium</div>
                  <p className="text-sm text-slate-400">Augmentez votre visibilité VOLTA</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Statistiques Section */}
        {activeTab === 'stats' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ color: '#FF8C00' }}>
                📊 Statistiques
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-600 mb-2">Taux d'occupation</div>
                  <div className="text-3xl font-bold text-white mb-2">78%</div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-600 mb-2">Note moyenne</div>
                  <div className="text-3xl font-bold text-white">4.8/5</div>
                  <div className="text-xs text-slate-600 mt-2">⭐⭐⭐⭐⭐</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-600 mb-2">Revenus ce mois</div>
                  <div className="text-3xl font-bold text-white">2.4M FCFA</div>
                  <div className="text-xs text-green-400 mt-2">↑ 12% vs mois précédent</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-600 mb-2">Clients satisfaits</div>
                  <div className="text-3xl font-bold text-white">234</div>
                  <div className="text-xs text-slate-600 mt-2">Locations complétées</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Paiements Section */}
        {activeTab === 'payments' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ color: '#FF8C00' }}>
                💰 Paiements
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Paiement #PAY{2000 + i}</div>
                        <div className="text-sm text-slate-600 mt-1">Période: {new Date(Date.now() - i * 30 * 86400000).toLocaleDateString('fr-FR')} - {new Date(Date.now() - (i - 1) * 30 * 86400000).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-green-400 mt-2">✓ Reçu</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{750000 * i} FCFA</div>
                        <button className="mt-2 px-4 py-2 rounded-lg text-white text-sm transition hover:scale-105" style={{ backgroundColor: '#FF8C00' }}>
                          📄 Facture
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Modale - Ajouter Équipement */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md p-8 animate-in scale-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
                  ➕ Ajouter équipement
                </h2>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-3xl text-slate-600 hover:text-slate-600 transition"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Équipement ajouté! En attente de vérification technique.')
                  setShowNewModal(false)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                  <input type="text" placeholder="ex: Pelle hydraulique CAT 320" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required>
                    <option>Pelleteuses</option>
                    <option>Bulldozers</option>
                    <option>Camions</option>
                    <option>Grues</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix par jour (FCFA)</label>
                  <input type="number" placeholder="150000" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Année</label>
                  <input type="number" placeholder="2022" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-white font-bold transition hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#FF8C00' }}
                >
                  ✓ Ajouter l'équipement
                </button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
