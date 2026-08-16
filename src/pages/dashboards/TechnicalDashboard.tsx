import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui'

export default function TechnicalDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [stats] = useState({ pending: 7, completed: 24, urgent: 2 })

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

            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Actions rapides
              </h2>
              <div className="space-y-2">
                <button className="w-full p-3 rounded-lg text-white transition hover:scale-105 transform" style={{ backgroundColor: '#FF8C00' }}>
                  ➕ Nouvelle inspection
                </button>
                <button className="w-full p-3 rounded-lg bg-slate-700 text-white transition hover:bg-slate-600">
                  📋 Rapports
                </button>
                <button className="w-full p-3 rounded-lg bg-slate-700 text-white transition hover:bg-slate-600">
                  📊 Statistiques
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
