import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, PageTitle, StatusBadge } from '../../components/ui'

const INSPECTION_LABEL = {
  ASSIGNED: 'À inspecter',
  IN_PROGRESS: 'En cours',
  DONE: 'Rapport envoyé',
} as const

export default function TechnicalMissions() {
  const { inspections, equipment, users, currentUser } = useStore()
  const mine = inspections.filter((i) => i.technicalTeamId === currentUser?.id)

  return (
    <div>
      <PageTitle title="Missions" subtitle="Inspections assignées par VOLTA." />
      {mine.length === 0 ? (
        <EmptyState title="Aucune mission" subtitle="Les missions assignées par VOLTA apparaîtront ici." />
      ) : (
        <div className="grid gap-4">
          {mine.map((i) => {
            const eq = equipment.find((e) => e.id === i.equipmentId)
            const supplier = users.find((u) => u.id === eq?.supplierId)
            return (
              <Card key={i.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <img src={eq?.photos[0]} alt={eq?.name} className="h-20 w-32 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{eq?.name}</span>
                    {eq && <StatusBadge status={eq.status} />}
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {INSPECTION_LABEL[i.status]}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Propriétaire : {supplier?.company} · Assignée le {i.assignedAt}
                  </div>
                </div>
                <Link
                  to={`/technical/inspection/${i.id}`}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {i.status === 'DONE' ? 'Voir le rapport' : 'Ouvrir l\'inspection'}
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
