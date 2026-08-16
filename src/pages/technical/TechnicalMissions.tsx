import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, PageTitle } from '../../components/ui'

const TEAM_ID = 'u-tech-1'

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  ASSIGNEE: { label: 'Assignée', cls: 'bg-amber-100 text-amber-700' },
  ASSIGNED: { label: 'Assignée', cls: 'bg-amber-100 text-amber-700' },
  EN_COURS: { label: 'En cours', cls: 'bg-brand-100 text-brand-700' },
  IN_PROGRESS: { label: 'En cours', cls: 'bg-brand-100 text-brand-700' },
  TERMINEE: { label: 'Terminée', cls: 'bg-emerald-100 text-emerald-700' },
  DONE: { label: 'Terminée', cls: 'bg-emerald-100 text-emerald-700' },
}

export default function TechnicalMissions() {
  const { inspections, equipment, users } = useStore()
  const missions = inspections.filter((i) => i.technicalTeamId === TEAM_ID)

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <Link to="/technical-dashboard" className="text-sm font-medium text-brand-600 hover:underline">← Retour au tableau de bord</Link>
      <div className="mt-2">
        <PageTitle
          title="Missions d'inspection"
          subtitle={`${missions.length} mission(s) assignée(s) par VOLTA`}
        />
      </div>

      {missions.length === 0 ? (
        <EmptyState title="Aucune mission" subtitle="Les missions assignées par l'administrateur apparaîtront ici." />
      ) : (
        <div className="grid gap-4">
          {missions.map((insp) => {
            const eq = equipment.find((e) => e.id === insp.equipmentId)
            const supplier = users.find((u) => u.id === eq?.supplierId)
            const filled = insp.checklist.filter((c) => c.result !== null).length
            const done = insp.status === 'TERMINEE' || insp.status === 'DONE'
            const status = STATUS_LABEL[insp.status] ?? STATUS_LABEL.ASSIGNEE
            return (
              <Card key={insp.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">{eq?.name ?? 'Équipement'}</h3>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{eq?.brand} {eq?.model} · {eq?.year} · 📍 {eq?.location}</p>
                    <p className="text-xs text-slate-500">Fournisseur : {supplier?.company} · Assignée le {insp.assignedAt}</p>
                    <p className="mt-1 text-xs text-slate-500">Checklist : {filled} / {insp.checklist.length}</p>
                  </div>
                  <Link
                    to={`/technical/inspection/${insp.id}`}
                    className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                      done ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-600 hover:bg-brand-700'
                    }`}
                  >
                    {done ? 'Voir le rapport' : filled > 0 ? 'Continuer l\'inspection' : 'Commencer l\'inspection'}
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
