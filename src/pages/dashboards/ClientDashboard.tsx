import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui'

export default function ClientDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'support'>('dashboard')
  const [showNewModal, setShowNewModal] = useState(false)
  const stats = { active: 3, pending: 2, completed: 12 }

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">👤 Tableau de bord Client</h1>
          <p className="text-slate-600 mt-1">Bienvenue, {user.company}</p>
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
                        <div className="text-sm text-slate-600 mt-1">📍 Abidjan • Fournisseur: BTP Solutions</div>
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
                        <div className="text-sm text-slate-600 mt-1">Camion benne • 2 jours</div>
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
                <button
                  onClick={() => setShowNewModal(true)}
                  className="w-full p-3 rounded-lg text-white transition hover:scale-105 transform"
                  style={{ backgroundColor: '#FF8C00' }}
                >
                  ➕ Nouvelle location
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full p-3 rounded-lg transition ${activeTab === 'history' ? 'text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  style={{ backgroundColor: activeTab === 'history' ? '#FF8C00' : undefined }}
                >
                  📋 Voir historique
                </button>
                <button
                  onClick={() => setActiveTab('support')}
                  className={`w-full p-3 rounded-lg transition ${activeTab === 'support' ? 'text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  style={{ backgroundColor: activeTab === 'support' ? '#FF8C00' : undefined }}
                >
                  💬 Support
                </button>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Informations de compte
              </h2>
              <div className="space-y-3 text-sm text-slate-600">
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

        {/* Historique Section */}
        {activeTab === 'history' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ color: '#FF8C00' }}>
                📋 Historique des locations
              </h2>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Location #LOC{5000 + i}</div>
                        <div className="text-sm text-slate-600 mt-1">Pelle hydraulique • {7 - i} jours • {150000 * (7 - i)} FCFA</div>
                        <div className="text-xs text-green-400 mt-2">✓ Complétée</div>
                      </div>
                      <button className="px-4 py-2 rounded-lg text-white transition hover:scale-105" style={{ backgroundColor: '#FF8C00' }}>
                        👁️ Détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Support Section */}
        {activeTab === 'support' && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ color: '#FF8C00' }}>
                💬 Support
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">📞</div>
                    <div>
                      <div className="font-semibold text-white">Support téléphonique</div>
                      <div className="text-slate-600 text-sm mt-1">+225 27 22 50 50 50</div>
                      <div className="text-xs text-slate-700 mt-1">Disponible 24/7</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">📧</div>
                    <div>
                      <div className="font-semibold text-white">Support par email</div>
                      <div className="text-slate-600 text-sm mt-1">support@volta.ci</div>
                      <div className="text-xs text-slate-700 mt-1">Réponse en moins de 2 heures</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">💬</div>
                    <div>
                      <div className="font-semibold text-white">Chat en direct</div>
                      <div className="text-slate-600 text-sm mt-1">Disponible sur le site</div>
                      <div className="text-xs text-slate-700 mt-1">Réponse immédiate</div>
                      <button className="mt-3 px-4 py-2 rounded-lg text-white transition hover:scale-105" style={{ backgroundColor: '#FF8C00' }}>
                        Ouvrir le chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Modale - Nouvelle Location */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md p-8 animate-in scale-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
                  ➕ Nouvelle location
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
                  alert('Location créée et en attente d\'approbation!')
                  setShowNewModal(false)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Équipement</label>
                  <input type="text" placeholder="Chercher un équipement..." className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
                  <input type="date" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin</label>
                  <input type="date" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes spéciales</label>
                  <textarea
                    placeholder="Besoins particuliers..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-white font-bold transition hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#FF8C00' }}
                >
                  ✓ Demander la location
                </button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
