import { useMemo, useState } from 'react'
import { AlertOctagon } from 'lucide-react'
import { apiPost } from '../store/api'
import { useStore } from '../store/StoreContext'
import { useLiveResource } from '../store/useLiveResource'
import { useToast } from '../components/feedback/Toaster'
import { AnomalyStatusBadge, Button, Card, EmptyState, Modal, PageTitle, SeverityBadge } from '../components/ui'
import { ANOMALY_NEXT, ANOMALY_STATUS, ANOMALY_SUPPLIER_TARGETS } from '../lib/statuses'
import type { Anomaly, AnomalyStatus } from '../store/types'

/**
 * Anomalies, vues par celui qui les traite.
 *
 * Le serveur ne rend à chacun que les siennes : au technicien celles qu'il a
 * relevées, au fournisseur celles qui pèsent sur ses engins, à l'administration
 * toutes. La page est donc la même pour les trois espaces ; ce qui change,
 * c'est ce que chacun peut faire — le fournisseur traite et soumet son action
 * corrective, l'administration examine, valide, clôture ou renvoie en
 * traitement. Le technicien lit.
 */
const INPUT =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-acier-500 focus:outline-none focus:ring-2 focus:ring-acier-200'

export default function AnomaliesPage() {
  const { currentUser, equipment } = useStore()
  const toast = useToast()
  const { data, loading, error, patch } = useLiveResource<Anomaly[]>('/anomalies')
  const anomalies = useMemo(() => data ?? [], [data])
  const [pending, setPending] = useState<{ anomaly: Anomaly; target: AnomalyStatus } | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const role = currentUser?.role
  const allowedTargets = (a: Anomaly): AnomalyStatus[] => {
    const next = ANOMALY_NEXT[a.status] ?? []
    if (role === 'ADMIN') return next
    if (role === 'SUPPLIER') return next.filter((s) => ANOMALY_SUPPLIER_TARGETS.includes(s))
    return []
  }

  const sorted = useMemo(
    () => [...anomalies].sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt)),
    [anomalies],
  )
  const openCount = anomalies.filter((a) => !ANOMALY_STATUS[a.status]?.terminal).length

  const run = async () => {
    if (!pending) return
    const supplierSide = role === 'SUPPLIER'
    setBusy(true)
    try {
      const updated = await apiPost<Anomaly>(`/anomalies/${pending.anomaly.id}/transition`, {
        status: pending.target,
        correctiveAction: supplierSide ? text.trim() || undefined : undefined,
        reviewNote: supplierSide ? undefined : text.trim() || undefined,
      })
      patch((current) => (current ?? []).map((x) => (x.id === updated.id ? updated : x)))
      toast.success('Anomalie mise à jour', `${updated.reference} est maintenant « ${ANOMALY_STATUS[updated.status].label} ».`)
      setPending(null)
      setText('')
    } catch (err) {
      toast.fromError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageTitle
        title="Anomalies"
        subtitle={
          role === 'SUPPLIER'
            ? 'Les points relevés sur vos engins en vérification. Traitez-les et soumettez votre action corrective.'
            : role === 'TECHNICAL'
              ? 'Les anomalies que vous avez relevées, et où en est leur traitement.'
              : 'Toutes les anomalies ouvertes en vérification ; examinez les actions correctives soumises.'
        }
      />

      {error && anomalies.length === 0 && !loading ? (
        <EmptyState icon={AlertOctagon} title="Anomalies indisponibles" subtitle="Le serveur a refusé la lecture." />
      ) : sorted.length === 0 && !loading ? (
        <EmptyState
          icon={AlertOctagon}
          title="Aucune anomalie"
          subtitle="Les anomalies relevées lors des vérifications apparaîtront ici."
        />
      ) : (
        <>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {openCount} en cours · {sorted.length - openCount} clôturée{sorted.length - openCount > 1 ? 's' : ''}
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {sorted.map((a) => {
              const targets = allowedTargets(a)
              const eq = equipment.find((e) => e.id === a.equipmentId)
              return (
                <Card key={a.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] font-semibold text-slate-400">{a.reference}</div>
                      <div className="text-sm font-semibold text-acier-900">{eq?.name ?? 'Engin'}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <SeverityBadge severity={a.severity} />
                      <AnomalyStatusBadge status={a.status} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{a.description}</p>
                  {a.correctiveAction && (
                    <div className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Action corrective : </span>
                      {a.correctiveAction}
                    </div>
                  )}
                  {a.reviewNote && (
                    <div className="mt-2 rounded-lg bg-acier-50 p-2.5 text-xs text-acier-800">
                      <span className="font-semibold">Examen : </span>
                      {a.reviewNote}
                    </div>
                  )}
                  {targets.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {targets.map((t) => (
                        <Button
                          key={t}
                          size="sm"
                          tone={t === 'RESOLVED' || t === 'CLOSED' ? 'success' : t === 'IN_PROGRESS' && a.status !== 'OPEN' ? 'secondary' : 'primary'}
                          onClick={() => {
                            setText('')
                            setPending({ anomaly: a, target: t })
                          }}
                        >
                          → {ANOMALY_STATUS[t].label}
                        </Button>
                      ))}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}

      <Modal
        open={pending !== null}
        onClose={() => (busy ? undefined : setPending(null))}
        title={pending ? `${pending.anomaly.reference} → ${ANOMALY_STATUS[pending.target].label}` : ''}
      >
        {pending && (
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">
                {role === 'SUPPLIER' ? 'Action corrective réalisée' : 'Note d’examen'}
                <span className="ml-1 text-xs font-normal text-slate-400">(facultatif)</span>
              </span>
              <textarea rows={3} className={`mt-1.5 ${INPUT}`} value={text} onChange={(e) => setText(e.target.value)} />
            </label>
            <div className="flex justify-end gap-2">
              <Button tone="secondary" onClick={() => setPending(null)} disabled={busy}>
                Retour
              </Button>
              <Button onClick={() => void run()} disabled={busy}>
                {busy ? 'Traitement…' : 'Confirmer'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
