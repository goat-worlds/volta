import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui'

export default function SupplierDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
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
          <p className="text-slate-400 mt-1">{user.company}</p>
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
                        <div className="text-sm text-slate-400 mt-1">État: Excellent • 2500h</div>
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
                        <div className="text-sm text-slate-400 mt-1">Pelle • 5 jours • {25000000 * i} FCFA</div>
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
                <button className="w-full p-3 rounded-lg text-white transition hover:scale-105 transform" style={{ backgroundColor: '#FF8C00' }}>
                  ➕ Ajouter équipement
                </button>
                <button className="w-full p-3 rounded-lg bg-slate-700 text-white transition hover:bg-slate-600">
                  📊 Statistiques
                </button>
                <button className="w-full p-3 rounded-lg bg-slate-700 text-white transition hover:bg-slate-600">
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
      </div>
    </div>
  )
}
