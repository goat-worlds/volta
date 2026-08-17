import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card } from '../../components/ui'

const TEAM_ID = 'u-tech-1'

export default function TechnicalDashboard() {
  const navigate = useNavigate()
  const { inspections, equipment, users, startInspection } = useStore()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('volta_user')
    if (!userStr) navigate('/login')
    else setUser(JSON.parse(userStr))
  }, [navigate])

  if (!user) return <div className="flex items-center justify-center h-screen">Chargement...</div>

  const mine = inspections.filter((i) => i.technicalTeamId === TEAM_ID)
  const assigned = mine.filter((i) => i.status === 'ASSIGNEE' || i.status === 'ASSIGNED')
  const inProgress = mine.filter((i) => i.status === 'EN_COURS' || i.status === 'IN_PROGRESS')
  const completed = mine.filter((i) => i.status === 'TERMINEE' || i.status === 'DONE')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white"><img src="/assets/check.svg" alt="🔧" className="w-8 h-8 inline mr-2" />Tableau de bord Équipe Technique</h1>
          <p className="text-slate-400 mt-1">Inspections et certifications d'équipements</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card dark className="p-6 bg-gradient-to-br from-accent-500 to-accent-600 text-white">
            <div className="text-3xl font-bold mb-2">{assigned.length}</div>
            <div className="text-accent-100">Missions assignées</div>
          </Card>
          <Card dark className="p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
            <div className="text-3xl font-bold mb-2">{inProgress.length}</div>
            <div className="text-brand-100">En inspection</div>
          </Card>
          <Card dark className="p-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
            <div className="text-3xl font-bold mb-2">{completed.length}</div>
            <div className="text-emerald-100">Rapports complétés</div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Assigned Missions */}
            <Card dark className="p-6 mb-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Missions d'inspection à commencer
              </h2>
              {assigned.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune mission assignée</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {assigned.map((insp) => {
                    const eq = equipment.find((e) => e.id === insp.equipmentId)
                    const supplier = users.find((u) => u.id === eq?.supplierId)
                    return (
                      <div key={insp.id} className="p-4 rounded-lg bg-amber-900/30 border border-amber-500/50 hover:bg-amber-900/40 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white"><img src="/assets/check.svg" alt="📋" className="w-5 h-5 inline mr-2" />{eq?.name ?? 'Équipement'}</div>
                            <div className="text-sm text-slate-400 mt-1">{eq?.brand} {eq?.model} · {eq?.year}</div>
                            <div className="text-xs text-slate-500 mt-1">Fournisseur: {supplier?.company}</div>
                            <div className="text-xs text-slate-500"><img src="/assets/check.svg" alt="📍" className="w-3 h-3 inline mr-1" />{eq?.location}</div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <Link
                              to={`/technical/inspection/${insp.id}`}
                              className="px-3 py-1 rounded text-white text-xs font-bold bg-brand-600 hover:bg-brand-700 text-center"
                            >
                              Voir détails
                            </Link>
                            <button
                              onClick={() => startInspection(insp.id)}
                              className="px-3 py-1 rounded text-white text-xs font-bold bg-green-600 hover:bg-green-700"
                            >
                              Commencer
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* In Progress */}
            <Card dark className="p-6 mb-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Inspections en cours
              </h2>
              {inProgress.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune inspection en cours</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {inProgress.map((insp) => {
                    const eq = equipment.find((e) => e.id === insp.equipmentId)
                    const filled = insp.checklist.filter((c) => c.result !== null).length
                    const complete = filled === insp.checklist.length
                    return (
                      <div key={insp.id} className="p-4 rounded-lg bg-blue-900/30 border border-brand-500/50 hover:bg-blue-900/40 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white"><img src="/assets/check.svg" alt="🔍" className="w-5 h-5 inline mr-2" />{eq?.name ?? 'Équipement'}</div>
                            <div className="text-xs text-slate-400 mt-1">Checklist: {filled}/{insp.checklist.length}</div>
                            <div className="w-full bg-slate-700 rounded h-1.5 mt-2">
                              <div
                                className="bg-green-500 h-full rounded transition-all"
                                style={{ width: `${(filled / insp.checklist.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <Link
                              to={`/technical/inspection/${insp.id}`}
                              className={`px-3 py-1 rounded text-white text-xs font-bold text-center ${
                                complete ? 'bg-purple-600 hover:bg-purple-700' : 'bg-brand-600 hover:bg-brand-700'
                              }`}
                            >
                              {complete ? 'Soumettre' : 'Continuer'}
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Completed Reports */}
            <Card dark className="p-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Rapports complétés
              </h2>
              {completed.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucun rapport complété</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {completed.map((insp) => {
                    const eq = equipment.find((e) => e.id === insp.equipmentId)
                    return (
                      <div key={insp.id} className="p-3 rounded-lg bg-green-900/30 border border-green-500/50 hover:bg-green-900/40 transition">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white text-sm"><img src="/assets/check.svg" alt="✓" className="w-4 h-4 inline mr-2" />{eq?.name}</div>
                            <div className="text-xs text-slate-400 mt-1">Rapport soumis</div>
                          </div>
                          <span className="text-emerald-400 text-sm font-bold">Complétée</span>
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
            {/* Quick Links */}
            <Card dark className="p-6 mb-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Navigation rapide
              </h2>
              <div className="space-y-2">
                <Link
                  to="/technical/missions"
                  className="w-full block p-3 rounded-lg text-white text-center transition hover:scale-105 transform text-sm bg-accent-500"
                >
                  <img src="/assets/check.svg" alt="📋" className="w-5 h-5 inline mr-2" />Toutes les missions
                </Link>
                <Link
                  to="/catalogue"
                  className="w-full p-3 rounded-lg transition text-white text-center bg-slate-700 hover:bg-slate-600 text-sm"
                >
                  <img src="/assets/check.svg" alt="📊" className="w-5 h-5 inline mr-2" />Voir catalogue
                </Link>
              </div>
            </Card>

            {/* Account Info */}
            <Card dark className="p-6 mb-6">
              <h2 className="text-xl font-bold text-accent-600 mb-4">
                Profil
              </h2>
              <div className="space-y-3 text-sm text-slate-300">
                <div>
                  <div className="font-semibold text-white">Nom</div>
                  <div className="text-slate-400">{user.name}</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Email</div>
                  <div className="text-slate-400 break-all">{user.email}</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Rôle</div>
                  <div className="text-slate-400"><img src="/assets/check.svg" alt="🔧" className="w-4 h-4 inline mr-1" />Équipe Technique</div>
                </div>
              </div>
            </Card>

            {/* Inspection Standards */}
            <Card dark className="p-6 bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 border border-emerald-500/30">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <img src="/assets/check.svg" alt="✓" className="w-5 h-5" />
                <span className="text-accent-600">Catégories</span>
              </h2>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-emerald-700/40 text-emerald-300">
                  <strong>A:</strong> Excellent état
                </div>
                <div className="p-2 rounded bg-brand-700/40 text-blue-300">
                  <strong>B:</strong> Bon état
                </div>
                <div className="p-2 rounded bg-yellow-700/40 text-yellow-300">
                  <strong>C:</strong> État moyen
                </div>
                <div className="p-2 rounded bg-orange-700/40 text-orange-300">
                  <strong>D:</strong> Nécessite intervention
                </div>
                <div className="p-2 rounded bg-red-700/40 text-red-300">
                  <strong>E:</strong> Non conforme
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
