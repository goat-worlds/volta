import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, PageTitle, StatCard, StatusBadge } from '../../components/ui'

const TEAM_ID = 'u-tech-1'

export default function TechnicalDashboard() {
  const { inspections, equipment, reports, notifications } = useStore()
  const mine = inspections.filter((i) => i.technicalTeamId === TEAM_ID)
  const assigned = mine.filter((i) => i.status === 'ASSIGNED')
  const inProgress = mine.filter((i) => i.status === 'IN_PROGRESS')
  const done = mine.filter((i) => i.status === 'DONE')
  const notifs = notifications.filter((n) => n.role === 'TECHNICAL')

  return (
    <div>
      <PageTitle title="Tableau de bord" subtitle="Société Technique ABC — Vérification d'engins VOLTA" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Missions assignées" value={mine.length} />
        <StatCard label="À inspecter" value={assigned.length} accent="text-amber-600" />
        <StatCard label="Inspections en cours" value={inProgress.length} accent="text-orange-600" />
        <StatCard label="Rapports envoyés" value={done.length + reports.length - done.length ? done.length : reports.length} accent="text-emerald-600" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Missions récentes</h2>
            <Link to="/technical/missions" className="text-sm font-medium text-blue-600 hover:underline">Voir tout</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {mine.slice(0, 5).map((i) => {
              const eq = equipment.find((e) => e.id === i.equipmentId)
              return (
                <Link key={i.id} to={`/technical/inspection/${i.id}`} className="flex items-center justify-between py-2.5 hover:bg-slate-50">
                  <div>
                    <div className="text-sm font-medium">{eq?.name}</div>
                    <div className="text-xs text-slate-500">Assignée le {i.assignedAt}</div>
                  </div>
                  {eq && <StatusBadge status={eq.status} />}
                </Link>
              )
            })}
            {mine.length === 0 && <div className="py-4 text-sm text-slate-500">Aucune mission assignée.</div>}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-bold">Notifications</h2>
          <div className="divide-y divide-slate-100">
            {notifs.slice(0, 6).map((n) => (
              <div key={n.id} className="py-2.5 text-sm">
                <div className="text-slate-700">{n.message}</div>
                <div className="text-xs text-slate-400">{n.date}</div>
              </div>
            ))}
            {notifs.length === 0 && <div className="py-4 text-sm text-slate-500">Aucune notification.</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}
