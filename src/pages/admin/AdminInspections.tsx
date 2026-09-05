import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Gavel, Inbox, UserCheck } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, PageTitle, StatusBadge, Toast } from '../../components/ui'
import { equipmentRef, inspectionRef } from '../../lib/references'

const LABEL = { ASSIGNED: 'Assignée', IN_PROGRESS: 'En cours', DONE: 'Terminée' } as const

/**
 * Le poste de pilotage des vérifications.
 *
 * L'écran se contentait de lister les inspections déjà créées et renvoyait
 * l'administrateur vers la page Engins pour agir — il fallait y filtrer par
 * statut puis ouvrir chaque fiche. Or c'est ici que la question se pose :
 * qu'est-ce qui attend une équipe, qu'est-ce qui tourne, qu'est-ce qui attend
 * ma décision. Les trois files sont donc réunies, et l'assignation se fait sur
 * place.
 */
export default function AdminInspections() {
  const { inspections, equipment, users, reports, assignInspection } = useStore()
  const [teamByEquipment, setTeamByEquipment] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const technicalTeams = users.filter((u) => u.role === 'TECHNICAL')
  const awaiting = equipment.filter((e) => e.status === 'SUBMITTED')
  const toDecide = equipment.filter((e) => e.status === 'PENDING_ADMIN_REVIEW')

  const flash = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 4000)
  }

  /** L'équipe montrée par le menu, y compris quand l'admin n'y a pas touché. */
  const teamFor = (equipmentId: string) => {
    const chosen = teamByEquipment[equipmentId]
    return technicalTeams.some((t) => t.id === chosen) ? chosen : (technicalTeams[0]?.id ?? '')
  }

  const assign = async (equipmentId: string, name: string) => {
    const teamId = teamFor(equipmentId)
    if (!teamId) return
    setBusy(equipmentId)
    try {
      await assignInspection(equipmentId, teamId)
      const team = technicalTeams.find((t) => t.id === teamId)
      flash(`${name} confié à ${team?.company || team?.name}.`)
    } catch (error) {
      flash(error instanceof Error ? `Assignation refusée : ${error.message}` : "L'assignation a échoué.")
    } finally {
      setBusy(null)
    }
  }

  const supplierOf = (supplierId: string) => {
    const supplier = users.find((u) => u.id === supplierId)
    return supplier?.company || supplier?.name || '—'
  }

  return (
    <div className="space-y-8">
      <PageTitle
        title="Vérifications"
        subtitle="Assignez les engins soumis, suivez les inspections, tranchez les rapports."
      />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <UserCheck size={15} />
          En attente d’assignation
          {awaiting.length > 0 && (
            <span className="rounded-full bg-btp-500 px-2 py-0.5 text-xs font-bold text-white">
              {awaiting.length}
            </span>
          )}
        </h2>

        {awaiting.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Rien à assigner"
            subtitle="Les engins soumis par les fournisseurs apparaîtront ici."
          />
        ) : (
          <div className="grid gap-3">
            {awaiting.map((e) => (
              <Card key={e.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <img src={e.photos[0]} alt={e.name} className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-acier-900">{e.name}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
                      {equipmentRef(e.id)}
                    </span>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {e.brand} {e.model} · {e.year} · soumis par {supplierOf(e.supplierId)}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={teamFor(e.id)}
                    onChange={(ev) => setTeamByEquipment((p) => ({ ...p, [e.id]: ev.target.value }))}
                    className="rounded-lg border border-slate-300 p-2 text-sm"
                    aria-label={`Équipe technique pour ${e.name}`}
                  >
                    {technicalTeams.map((t) => (
                      <option key={t.id} value={t.id}>{t.company || t.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => assign(e.id, e.name)}
                    disabled={busy === e.id || technicalTeams.length === 0}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {busy === e.id ? 'Assignation…' : 'Assigner'}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <ClipboardCheck size={15} />
          Inspections en cours
        </h2>

        {inspections.length === 0 ? (
          <EmptyState title="Aucune inspection" subtitle="Les missions assignées apparaîtront ici." />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mission</th>
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
                  const team = users.find((u) => u.id === i.technicalTeamId)
                  const filled = i.checklist.filter((c) => c.result !== null).length
                  return (
                    <tr key={i.id}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{inspectionRef(i.id)}</td>
                      <td className="px-4 py-3 font-medium text-acier-900">{eq?.name ?? '—'}</td>
                      <td className="px-4 py-3">{team?.company || team?.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{i.assignedAt}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          {LABEL[i.status]}
                        </span>
                        {i.checklist.length > 0 && (
                          <span className="ml-2 text-xs text-slate-400">
                            {filled}/{i.checklist.length}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{eq && <StatusBadge status={eq.status} />}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <Gavel size={15} />
          Rapports à trancher
          {toDecide.length > 0 && (
            <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs font-bold text-white">
              {toDecide.length}
            </span>
          )}
        </h2>

        {toDecide.length === 0 ? (
          <EmptyState
            icon={Gavel}
            title="Aucune décision en attente"
            subtitle="Les rapports transmis par les équipes techniques apparaîtront ici."
          />
        ) : (
          <div className="grid gap-3">
            {toDecide.map((e) => {
              const report = reports.find((r) => r.equipmentId === e.id)
              return (
                <Card key={e.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <img src={e.photos[0]} alt={e.name} className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-acier-900">{e.name}</span>
                      <StatusBadge status={e.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {report?.summary ?? 'Rapport transmis, en attente de lecture.'}
                    </p>
                  </div>
                  {/* La décision — niveau, refus, corrections — se prend sur la
                      fiche, où le rapport complet est affiché. */}
                  <Link
                    to="/admin/equipment"
                    className="shrink-0 rounded-lg bg-purple-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-purple-700"
                  >
                    Ouvrir la décision
                  </Link>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <Toast message={toast} />
    </div>
  )
}
