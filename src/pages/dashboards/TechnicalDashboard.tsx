import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui'

export default function TechnicalDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [stats] = useState({ pending: 7, completed: 24, urgent: 2 })
  const [activeTab, setActiveTab] = useState<'missions' | 'reports' | 'stats'>('missions')
  const [showNewModal, setShowNewModal] = useState(false)

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
          <h1 className="text-3xl font-bold text-white">🔧 Tableau de bord Équipe Technique</h1>
          <p className="text-slate-400 mt-1">Vérifications et inspections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-red-600 to-red-700 text-white">
            <div className="text-3xl font-bold mb-2">{stats.urgent}</div>
            <div className="text-red-100">Inspections urgentes</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
            <div className="text-3xl font-bold mb-2">{stats.pending}</div>
            <div className="text-yellow-100">En attente</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 text-white">
            <div className="text-3xl font-bold mb-2">{stats.completed}</div>
            <div className="text-green-100">Inspections complétées</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Missions d'inspection urgentes
              </h2>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-white">🚨 Pelle #REF{i}</div>
                        <div className="text-sm text-slate-300 mt-1">Fournisseur: BTP Solutions • Localisation: Abidjan</div>
                        <div className="text-xs text-red-300 mt-2">⚠️ Vérification urgente demandée</div>
                      </div>
                      <button style={{ backgroundColor: '#FF8C00' }} className="px-3 py-1 rounded text-white text-sm font-bold hover:opacity-90">
                        Assigner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Inspections en cours
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Inspection #{i}</div>
                        <div className="text-sm text-slate-400 mt-1">Vérification: Mécanicien, Entrepôt, Pièces</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">
                          Détails
                        </button>
                        <button className="px-2 py-1 rounded bg-green-600 text-white text-xs font-bold hover:bg-green-700">
                          Valider
                        </button>
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
                Critères de vérification
              </h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded bg-slate-700">
                  <div className="font-semibold text-white">🔧 Mécanicien</div>
                  <div className="text-slate-300 text-xs mt-1">Certification vérifiée</div>
                </div>
                <div className="p-3 rounded bg-slate-700">
                  <div className="font-semibold text-white">⚡ Remplacement 24h</div>
                  <div className="text-slate-300 text-xs mt-1">Garantie confirmée</div>
                </div>
                <div className="p-3 rounded bg-slate-700">
                  <div className="font-semibold text-white">🏭 Entrepôt</div>
                  <div className="text-slate-300 text-xs mt-1">Stocks inspectés</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Actions rapides
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setShowNewModal(true)}
                  className="w-full p-3 rounded-lg text-white transition hover:scale-105 transform"
                  style={{ backgroundColor: '#FF8C00' }}
                >
                  ➕ Nouvelle inspection
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full p-3 rounded-lg transition ${activeTab === 'reports' ? 'text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  style={{ backgroundColor: activeTab === 'reports' ? '#FF8C00' : undefined }}
                >
                  📋 Rapports
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full p-3 rounded-lg transition ${activeTab === 'stats' ? 'text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  style={{ backgroundColor: activeTab === 'stats' ? '#FF8C00' : undefined }}
                >
                  📊 Statistiques
                </button>
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

        {/* Rapports Section */}
        {activeTab === 'reports' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ color: '#FF8C00' }}>
                📋 Rapports d'inspection
              </h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Rapport #INS{1000 + i}</div>
                        <div className="text-sm text-slate-400 mt-1">Fournisseur: BTP Solutions • Date: {new Date(Date.now() - i * 86400000).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-slate-500 mt-2">Statut: Approuvé ✓</div>
                      </div>
                      <button className="px-4 py-2 rounded-lg text-white transition hover:scale-105" style={{ backgroundColor: '#FF8C00' }}>
                        📥 Télécharger
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Statistiques Section */}
        {activeTab === 'stats' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ color: '#FF8C00' }}>
                📊 Statistiques d'inspection
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Taux d'approbation</div>
                  <div className="text-3xl font-bold text-white mb-2">94%</div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Délai moyen (heures)</div>
                  <div className="text-3xl font-bold text-white">2.5h</div>
                  <div className="text-xs text-slate-400 mt-2">↓ 15% vs mois précédent</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Inspections ce mois</div>
                  <div className="text-3xl font-bold text-white">31</div>
                  <div className="text-xs text-slate-400 mt-2">↑ 8% vs mois précédent</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Rejets (problèmes)</div>
                  <div className="text-3xl font-bold text-red-400">3</div>
                  <div className="text-xs text-slate-400 mt-2">Documentation incomplète</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Modale - Nouvelle Inspection */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md p-8 animate-in scale-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
                  ➕ Nouvelle inspection
                </h2>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-3xl text-slate-400 hover:text-slate-600 transition"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Inspection créée avec succès!')
                  setShowNewModal(false)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fournisseur</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required>
                    <option>Sélectionner un fournisseur</option>
                    <option>BTP Solutions</option>
                    <option>TechBuild</option>
                    <option>Équipements Pro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type d'inspection</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required>
                    <option>Sélectionner un type</option>
                    <option>Mécanicien</option>
                    <option>Entrepôt</option>
                    <option>Remplacement 24h</option>
                    <option>Complète</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea
                    placeholder="Détails de l'inspection..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-white font-bold transition hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#FF8C00' }}
                >
                  ✓ Créer l'inspection
                </button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
