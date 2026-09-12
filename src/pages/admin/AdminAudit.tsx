import { useMemo, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { useLiveResource } from '../../store/useLiveResource'
import { Card, EmptyState, PageTitle } from '../../components/ui'
import type { AuditEvent } from '../../store/types'

/**
 * Journal d'audit.
 *
 * Le serveur enregistre chaque opération sensible : qui, quoi, sur quel objet,
 * quand. L'écran le lit tel quel, du plus récent au plus ancien, avec un
 * filtre par type d'objet — c'est la trace qu'on ouvre quand on cherche à
 * comprendre comment une réservation ou un engin est arrivé dans son état.
 */
const ENTITY_LABEL: Record<string, string> = {
  EQUIPMENT: 'Engin',
  INSPECTION: 'Inspection',
  RENTAL_REQUEST: 'Réservation',
  QUOTE_REQUEST: 'Demande de devis',
  QUOTE: 'Devis',
  ANOMALY: 'Anomalie',
  OPPORTUNITY: 'Opportunité',
  USER: 'Utilisateur',
}

export default function AdminAudit() {
  const { data, loading, error } = useLiveResource<AuditEvent[]>('/audit')
  const events = useMemo(() => data ?? [], [data])
  const [entity, setEntity] = useState<string>('all')

  const types = useMemo(() => Array.from(new Set(events.map((e) => e.entityType))).sort(), [events])
  const visible = useMemo(
    () =>
      [...events]
        .filter((e) => entity === 'all' || e.entityType === entity)
        .sort((a, b) => b.at.localeCompare(a.at)),
    [events, entity],
  )

  return (
    <div>
      <PageTitle title="Journal d’audit" subtitle="Toutes les opérations sensibles, telles que le serveur les a enregistrées." />

      {types.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <FilterChip active={entity === 'all'} onClick={() => setEntity('all')} label={`Tout (${events.length})`} />
          {types.map((t) => (
            <FilterChip
              key={t}
              active={entity === t}
              onClick={() => setEntity(t)}
              label={`${ENTITY_LABEL[t] ?? t} (${events.filter((e) => e.entityType === t).length})`}
            />
          ))}
        </div>
      )}

      {error && events.length === 0 && !loading ? (
        <EmptyState icon={ScrollText} title="Journal indisponible" subtitle="Le serveur a refusé la lecture du journal." />
      ) : visible.length === 0 && !loading ? (
        <EmptyState icon={ScrollText} title="Aucun événement" subtitle="Les opérations apparaîtront ici au fil de l’activité." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Quand</th>
                <th className="px-4 py-3">Qui</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Objet</th>
                <th className="px-4 py-3">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-slate-500">{formatAt(e.at)}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-800">{e.actorName ?? '—'}</div>
                    <div className="text-xs text-slate-400">{e.actorRole ?? ''}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-md bg-acier-50 px-2 py-0.5 font-mono text-xs font-semibold text-acier-800">
                      {e.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="text-xs text-slate-500">{ENTITY_LABEL[e.entityType] ?? e.entityType}</div>
                    <div className="font-mono text-xs font-semibold text-slate-800">{e.entityReference ?? e.entityId}</div>
                  </td>
                  <td className="max-w-md px-4 py-2.5 text-xs text-slate-600">{e.details ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active ? 'bg-acier-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  )
}

function formatAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}
