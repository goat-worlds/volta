import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, PageTitle } from '../../components/ui'
import type { InspectionStatus } from '../../store/types'

const INSPECTION_STATUS: Record<InspectionStatus, { label: string; cls: string }> = {
  A_ASSIGNER: { label: 'À assigner', cls: 'bg-slate-100 text-slate-700' },
  ASSIGNEE: { label: 'Assignée', cls: 'bg-amber-100 text-amber-700' },
  ASSIGNED: { label: 'Assignée', cls: 'bg-amber-100 text-amber-700' },
  EN_COURS: { label: 'En cours', cls: 'bg-brand-100 text-brand-700' },
  IN_PROGRESS: { label: 'En cours', cls: 'bg-brand-100 text-brand-700' },
  TERMINEE: { label: 'Terminée', cls: 'bg-emerald-100 text-emerald-700' },
  DONE: { label: 'Terminée', cls: 'bg-emerald-100 text-emerald-700' },
}

export default function AdminInspections() {
  const { inspections, equipment, users, quoteRequests, reports } = useStore()

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <Link to="/admin-dashboard" className="text-sm font-medium text-brand-600 hover:underline">← Retour au tableau de bord</Link>
      <div className="mt-2">
        <PageTitle
          title="Inspections"
          subtitle={`${inspections.length} inspection(s) — assignées aux services techniques`}
        />
      </div>

      {inspections.length === 0 ? (
        <EmptyState
          title="Aucune inspection"
          subtitle="Assignez une inspection depuis la page Demandes de devis."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-700">
              <tr>
                <th className="px-4 py-3">Engin</th>
                <th className="px-4 py-3">Demande</th>
                <th className="px-4 py-3">Équipe technique</th>
                <th className="px-4 py-3">Assignée le</th>
                <th className="px-4 py-3">Avancement</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inspections.map((insp) => {
                const eq = equipment.find((e) => e.id === insp.equipmentId)
                const tech = users.find((u) => u.id === insp.technicalTeamId)
                const quote = quoteRequests.find((q) => q.id === insp.quoteRequestId)
                const report = reports.find((r) => r.inspectionId === insp.id)
                const filled = insp.checklist.filter((c) => c.result !== null).length
                const status = INSPECTION_STATUS[insp.status]
                const done = insp.status === 'TERMINEE' || insp.status === 'DONE'
                return (
                  <tr key={insp.id}>
                    <td className="px-4 py-3 font-medium">
                      <Link to={`/equipment/${insp.equipmentId}`} className="text-brand-600 hover:underline">
                        {eq?.name ?? 'Équipement'} →
                      </Link>
                    </td>
                    <td className="px-4 py-3">{quote?.reference}</td>
                    <td className="px-4 py-3">{tech?.company}</td>
                    <td className="px-4 py-3">{insp.assignedAt}</td>
                    <td className="px-4 py-3">{filled} / {insp.checklist.length}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {done && report && quote ? (
                        <Link to={`/admin/validate/${quote.id}`} className="rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-600">
                          Valider le rapport
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-500">En attente du rapport</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
