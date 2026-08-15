import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, PageTitle, StatusBadge } from '../../components/ui'

const LABEL = { ASSIGNED: 'Assignée', IN_PROGRESS: 'En cours', DONE: 'Terminée' } as const

export default function AdminInspections() {
  const { inspections, equipment, users } = useStore()

  return (
    <div>
      <PageTitle title="Inspections" subtitle="Missions d'inspection assignées aux équipes techniques." />
      {inspections.length === 0 ? (
        <EmptyState title="Aucune inspection" subtitle="Assignez une inspection depuis la page Engins." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Engin</th>
                <th className="px-4 py-3">Équipe technique</th>
                <th className="px-4 py-3">Assignée le</th>
                <th className="px-4 py-3">Inspection</th>
                <th className="px-4 py-3">Statut engin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inspections.map((i) => {
                const eq = equipment.find((e) => e.id === i.equipmentId)
                return (
                  <tr key={i.id}>
                    <td className="px-4 py-3 font-medium">{eq?.name}</td>
                    <td className="px-4 py-3">{users.find((u) => u.id === i.technicalTeamId)?.company}</td>
                    <td className="px-4 py-3">{i.assignedAt}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{LABEL[i.status]}</span>
                    </td>
                    <td className="px-4 py-3">{eq && <StatusBadge status={eq.status} />}</td>
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
