import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, PageTitle, StatCard, StatusBadge } from '../../components/ui'

export default function AdminDashboard() {
  const { equipment, inspections, reports, rentalRequests, users, notifications } = useStore()
  const referenced = equipment.filter((e) => ['REFERENCED', 'PUBLISHED'].includes(e.status)).length
  const pending = equipment.filter((e) =>
    ['SUBMITTED', 'PENDING_INSPECTION', 'INSPECTION_IN_PROGRESS', 'REPORT_SUBMITTED', 'PENDING_ADMIN_REVIEW'].includes(e.status),
  ).length
  const suppliers = users.filter((u) => u.role === 'SUPPLIER').length
  const technicalTeams = users.filter((u) => u.role === 'TECHNICAL').length
  const notifs = notifications.filter((n) => n.role === 'ADMIN')

  return (
    <div>
      <PageTitle title="Tableau de bord" subtitle="Vue d'ensemble de la plateforme VOLTA." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Engins référencés" value={referenced} accent="text-emerald-600" />
        <StatCard label="Engins en attente" value={pending} accent="text-amber-600" />
        <StatCard label="Inspections" value={inspections.length} />
        <StatCard label="Rapports" value={reports.length} accent="text-indigo-600" />
        <StatCard label="Demandes de location" value={rentalRequests.length} accent="text-purple-600" />
        <StatCard label="Fournisseurs" value={suppliers} />
        <StatCard label="Équipes techniques" value={technicalTeams} />
        <StatCard label="Engins total" value={equipment.length} accent="text-slate-700" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Engins en attente d'action</h2>
            <Link to="/admin/equipment" className="text-sm font-medium text-blue-600 hover:underline">Voir tout</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {equipment
              .filter((e) => ['SUBMITTED', 'PENDING_ADMIN_REVIEW', 'REFERENCED'].includes(e.status))
              .slice(0, 6)
              .map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2.5">
                  <div className="text-sm font-medium">{e.name}</div>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            {equipment.filter((e) => ['SUBMITTED', 'PENDING_ADMIN_REVIEW', 'REFERENCED'].includes(e.status)).length === 0 && (
              <div className="py-4 text-sm text-slate-500">Aucun engin en attente d'action.</div>
            )}
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
