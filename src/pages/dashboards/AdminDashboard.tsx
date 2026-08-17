import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, QuoteStatusBadge } from '../../components/ui'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { quoteRequests, inspections, equipment, users } = useStore()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('volta_user')
    if (!userStr) navigate('/login')
    else setUser(JSON.parse(userStr))
  }, [navigate])

  if (!user) return <div className="flex items-center justify-center h-screen">Chargement...</div>

  const pendingQuotes = quoteRequests.filter((qr) => qr.status === 'NOUVELLE' || qr.status === 'TRANSMISE')
  const inInspection = quoteRequests.filter((qr) => qr.status === 'EN_INSPECTION')
  const toBeReviewed = quoteRequests.filter((qr) => qr.status === 'RAPPORT_REÇU')
  const totalRequests = quoteRequests.length

  const suppliers = users.filter((u) => u.role === 'SUPPLIER')
  const clients = users.filter((u) => u.role === 'CLIENT')
  const technicians = users.filter((u) => u.role === 'TECHNICAL')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white"><img src="/assets/check.svg" alt="👨‍💼" className="w-8 h-8 inline mr-2" />Administration VOLTA</h1>
          <p className="text-slate-400 mt-1">Contrôle et gestion plateforme</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card dark className="p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
            <div className="text-3xl font-bold mb-2">{totalRequests}</div>
            <div className="text-brand-100">Demandes totales</div>
          </Card>
          <Card dark className="p-6 bg-gradient-to-br from-accent-500 to-accent-600 text-white">
            <div className="text-3xl font-bold mb-2">{pendingQuotes.length}</div>
            <div className="text-accent-100">À traiter</div>
          </Card>
          <Card dark className="p-6 bg-gradient-to-br from-violet-600 to-violet-700 text-white">
            <div className="text-3xl font-bold mb-2">{inInspection.length}</div>
            <div className="text-violet-100">En inspection</div>
          </Card>
          <Card dark className="p-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
            <div className="text-3xl font-bold mb-2">{toBeReviewed.length}</div>
            <div className="text-emerald-100">À valider</div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Pending Quotes */}
            <Card dark className="p-6 mb-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Demandes en attente de traitement
              </h2>
              {pendingQuotes.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune demande en attente</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {pendingQuotes.map((qr) => {
                    const eq = equipment.find((e) => e.id === qr.equipmentId)
                    const supplier = users.find((u) => u.id === qr.supplierId)
                    return (
                      <Link key={qr.id} to="/admin/quotes" className="block p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white">{qr.reference}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              Client: {qr.clientName} | Équipement: {eq?.name}
                            </div>
                            <div className="text-xs text-slate-500">Fournisseur: {supplier?.company}</div>
                          </div>
                          <QuoteStatusBadge status={qr.status} />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Inspections in Progress */}
            <Card dark className="p-6 mb-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Inspections en cours
              </h2>
              {inInspection.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune inspection en cours</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {inInspection.map((qr) => {
                    const eq = equipment.find((e) => e.id === qr.equipmentId)
                    const insp = inspections.find((i) => i.quoteRequestId === qr.id)
                    return (
                      <Link key={qr.id} to="/admin/inspections" className="block p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-white">{qr.reference}</div>
                            <div className="text-xs text-slate-400 mt-1">{eq?.name}</div>
                            {insp && (
                              <div className="text-xs text-amber-400 mt-1">
                                <img src="/assets/check.svg" alt="📋" className="w-3 h-3 inline mr-1" />Inspection: {insp.status}
                              </div>
                            )}
                          </div>
                          <QuoteStatusBadge status={qr.status} />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Reports to Review */}
            <Card dark className="p-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Rapports à valider
              </h2>
              {toBeReviewed.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucun rapport à valider</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {toBeReviewed.map((qr) => {
                    const eq = equipment.find((e) => e.id === qr.equipmentId)
                    return (
                      <div key={qr.id} className="p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-white">{qr.reference}</div>
                            <div className="text-xs text-slate-400 mt-1">{eq?.name}</div>
                            <div className="text-xs text-emerald-400 mt-1"><img src="/assets/check.svg" alt="📊" className="w-3 h-3 inline mr-1" />Rapport reçu</div>
                          </div>
                          <Link
                            to={`/admin/validate/${qr.id}`}
                            className="px-3 py-1 rounded text-white text-sm font-bold transition hover:scale-105 bg-accent-500"
                          >
                            Valider
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {/* Platform Overview */}
            <Card dark className="p-6 mb-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Plateforme
              </h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-slate-700">
                  <div className="text-2xl text-blue-400 font-bold">{suppliers.length}</div>
                  <div className="text-slate-400">Fournisseurs actifs</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-700">
                  <div className="text-2xl text-purple-400 font-bold">{clients.length}</div>
                  <div className="text-slate-400">Clients inscrits</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-700">
                  <div className="text-2xl text-emerald-400 font-bold">{technicians.length}</div>
                  <div className="text-slate-400">Techniciens VOLTA</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-700">
                  <div className="text-2xl text-accent-500 font-bold">{equipment.length}</div>
                  <div className="text-slate-400">Équipements listés</div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card dark className="p-6 mb-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Actions rapides
              </h2>
              <div className="space-y-2">
                <Link
                  to="/admin/quotes"
                  className="w-full block p-3 rounded-lg text-white text-center transition hover:scale-105 transform text-sm bg-accent-500 flex items-center justify-center gap-2"
                >
                  <img src="/assets/check.svg" alt="List" className="w-4 h-4" />
                  Toutes les demandes
                </Link>
                <Link
                  to="/admin/inspections"
                  className="w-full p-3 rounded-lg transition text-white text-center bg-slate-700 hover:bg-slate-600 text-sm"
                >
                  🔍 Inspections
                </Link>
              </div>
            </Card>

            {/* Platform Info */}
            <Card dark className="p-6 bg-gradient-to-br from-brand-600/20 to-brand-700/20 border border-brand-500/30">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <img src="/assets/check.svg" alt="ℹ️" className="w-6 h-6" />
                <span className="text-accent-600">Modèle VOLTA</span>
              </h2>
              <div className="space-y-2 text-xs text-slate-300">
                <p className="leading-relaxed">
                  🔍 VOLTA inspecte chaque équipement et assigne une catégorie (A/B/C/D/E).
                </p>
                <p className="leading-relaxed">
                  💰 Zéro commission - Les clients et fournisseurs négocient directement les tarifs.
                </p>
                <p className="leading-relaxed">
                  ✓ Votre rôle: Assurer la qualité et la conformité technique.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
