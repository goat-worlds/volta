import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, QuoteStatusBadge } from '../../components/ui'

export default function SupplierDashboard() {
  const navigate = useNavigate()
  const { quoteRequests, equipment } = useStore()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('volta_user')
    if (!userStr) navigate('/login')
    else setUser(JSON.parse(userStr))
  }, [navigate])

  if (!user) return <div className="flex items-center justify-center h-screen">Chargement...</div>

  const supplierEquipment = equipment.filter((e) => e.supplierId === user.id)
  const myRequests = quoteRequests.filter((qr) => qr.supplierId === user.id)
  const newRequests = myRequests.filter((qr) => qr.status === 'NOUVELLE' || qr.status === 'TRANSMISE')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">🏭 Tableau de bord Fournisseur</h1>
          <p className="text-slate-400 mt-1">{user.company}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card dark className="p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
            <div className="text-3xl font-bold mb-2">{supplierEquipment.length}</div>
            <div className="text-brand-100">Équipements listés</div>
          </Card>
          <Card dark className="p-6 bg-gradient-to-br from-accent-500 to-accent-600 text-white">
            <div className="text-3xl font-bold mb-2">{newRequests.length}</div>
            <div className="text-accent-100">Nouvelles demandes</div>
          </Card>
          <Card dark className="p-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
            <div className="text-3xl font-bold mb-2">{myRequests.length}</div>
            <div className="text-emerald-100">Demandes totales</div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* New Requests */}
            <Card dark className="p-6 mb-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Nouvelles demandes reçues
              </h2>
              {newRequests.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune nouvelle demande</p>
              ) : (
                <div className="space-y-3">
                  {newRequests.map((qr) => {
                    const eq = equipment.find((e) => e.id === qr.equipmentId)
                    return (
                      <Link key={qr.id} to="/supplier/equipment" className="block p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white">{qr.reference} • {qr.clientName}</div>
                            <div className="text-sm text-slate-400 mt-1">{qr.clientCompany}</div>
                            <div className="text-xs text-slate-500 mt-1">Équipement: {eq?.name} • {qr.duration}</div>
                            <div className="text-xs text-slate-500">
                              📞 {qr.clientPhone} | 📧 {qr.clientEmail}
                            </div>
                          </div>
                          <QuoteStatusBadge status={qr.status} />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* All Requests */}
            <Card dark className="p-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Toutes les demandes
              </h2>
              {myRequests.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune demande reçue</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {myRequests.map((qr) => {
                    const eq = equipment.find((e) => e.id === qr.equipmentId)
                    return (
                      <Link key={qr.id} to="/supplier/equipment" className="block p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white text-sm">{qr.reference}</div>
                            <div className="text-xs text-slate-400 mt-1">{qr.clientName} • {eq?.name}</div>
                          </div>
                          <QuoteStatusBadge status={qr.status} />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {/* Quick Actions */}
            <Card dark className="p-6 mb-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Actions rapides
              </h2>
              <div className="space-y-2">
                <Link
                  to="/supplier/equipment"
                  className="w-full block p-3 rounded-lg text-white text-center transition hover:scale-105 transform bg-accent-500"
                >
                  🛠️ Mes équipements
                </Link>
                <Link
                  to="/catalogue"
                  className="w-full p-3 rounded-lg transition text-white text-center bg-slate-700 hover:bg-slate-600"
                >
                  📊 Voir le catalogue
                </Link>
              </div>
            </Card>

            {/* Account Info */}
            <Card dark className="p-6 mb-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Informations d'entreprise
              </h2>
              <div className="space-y-3 text-sm text-slate-300">
                <div>
                  <div className="font-semibold text-white">Entreprise</div>
                  <div className="text-slate-400">{user.company}</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Région</div>
                  <div className="text-slate-400">{user.city}</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Email</div>
                  <div className="text-slate-400 break-all">{user.email}</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Téléphone</div>
                  <div className="text-slate-400">{user.phone}</div>
                </div>
              </div>
            </Card>

            {/* Certification Status */}
            <Card dark className="p-6 bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 border border-emerald-500/30">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="text-accent-600">Certifications</span>
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 p-2 rounded bg-emerald-700/40">
                  <span>🔧</span>
                  <span className="text-white">Mécanicien Qualifié</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-emerald-700/40">
                  <span>🏭</span>
                  <span className="text-white">Entrepôt Équipé</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-emerald-700/40">
                  <span>✓</span>
                  <span className="text-white">Certifié VOLTA</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
