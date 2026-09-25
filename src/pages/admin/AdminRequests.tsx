import { useMemo, useState } from 'react'
import { CalendarCheck, CheckCircle2, Play, ShieldCheck, XCircle, Flag } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useToast } from '../../components/feedback/Toaster'
import { Button, Card, EmptyState, Modal, PageTitle, RentalStatusBadge, StatCard } from '../../components/ui'
import { RENTAL_ORDER, RENTAL_STATUS } from '../../lib/statuses'
import type { RentalAdminAction, RentalRequest, RentalStatus } from '../../store/types'

/**
 * Réservations, vues de l'administration.
 *
 * Le tableau ne faisait que lister, avec « En attente » écrit en dur sur
 * chaque ligne quel que soit le statut réel. Le serveur tient désormais le
 * parcours complet — qualifier, confirmer, démarrer, clôturer, annuler — et
 * c'est ici que l'administration le fait avancer.
 *
 * Chaque ligne ne propose que les transitions permises depuis son statut ;
 * le serveur les vérifie de son côté, et son refus s'affiche tel quel.
 */

/** Ce que l'administration peut faire depuis chaque statut (RentalWorkflow). */
const ADMIN_ACTIONS: Record<RentalStatus, RentalAdminAction[]> = {
  PENDING: ['qualify', 'cancel'],
  QUALIFIED: ['cancel'],
  ACCEPTED: ['confirm', 'cancel'],
  CONFIRMED: ['start', 'cancel'],
  IN_PROGRESS: ['complete', 'cancel'],
  COMPLETED: [],
  DECLINED: [],
  CANCELLED: [],
}

const ACTION_META: Record<
  RentalAdminAction,
  { label: string; icon: typeof Play; tone: 'primary' | 'success' | 'danger' | 'secondary'; note: 'none' | 'optional' | 'required'; done: string }
> = {
  qualify: { label: 'Qualifier', icon: ShieldCheck, tone: 'primary', note: 'optional', done: 'qualifiée' },
  confirm: { label: 'Confirmer', icon: CheckCircle2, tone: 'success', note: 'optional', done: 'confirmée' },
  start: { label: 'Démarrer', icon: Play, tone: 'primary', note: 'none', done: 'démarrée' },
  complete: { label: 'Clôturer', icon: Flag, tone: 'success', note: 'optional', done: 'clôturée' },
  cancel: { label: 'Annuler', icon: XCircle, tone: 'danger', note: 'required', done: 'annulée' },
}

type Filter = 'all' | 'open' | 'closed'

export default function AdminRequests() {
  const { rentalRequests, equipment, users, transitionRentalRequest } = useStore()
  const toast = useToast()
  const [filter, setFilter] = useState<Filter>('open')
  const [pending, setPending] = useState<{ request: RentalRequest; action: RentalAdminAction } | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const sorted = useMemo(
    () => [...rentalRequests].sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt)),
    [rentalRequests],
  )
  const visible = sorted.filter((r) => {
    const terminal = RENTAL_STATUS[r.status]?.terminal ?? false
    return filter === 'all' ? true : filter === 'open' ? !terminal : terminal
  })

  const counts = useMemo(() => {
    const by: Partial<Record<RentalStatus, number>> = {}
    for (const r of rentalRequests) by[r.status] = (by[r.status] ?? 0) + 1
    return by
  }, [rentalRequests])

  const run = async () => {
    if (!pending) return
    const meta = ACTION_META[pending.action]
    if (meta.note === 'required' && !note.trim()) {
      toast.warning('Motif requis', 'Indiquez pourquoi cette réservation est annulée.')
      return
    }
    setBusy(true)
    try {
      const updated = await transitionRentalRequest(
        pending.request.id,
        pending.action,
        meta.note === 'none' ? undefined : note.trim() || undefined,
      )
      toast.success(`Réservation ${meta.done}`, `${updated.reference} est maintenant « ${RENTAL_STATUS[updated.status].label} ».`)
      setPending(null)
      setNote('')
    } catch (err) {
      toast.fromError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageTitle
        title="Réservations"
        subtitle="Le parcours VOLTA : la demande est qualifiée, le fournisseur accepte, l’administration confirme et suit l’exécution."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Nouvelles à qualifier" value={counts.PENDING ?? 0} icon={ShieldCheck} accent="text-amber-700" />
        <StatCard label="Acceptées à confirmer" value={counts.ACCEPTED ?? 0} icon={CheckCircle2} />
        <StatCard label="En cours" value={counts.IN_PROGRESS ?? 0} icon={Play} accent="text-emerald-700" />
        <StatCard label="Terminées" value={counts.COMPLETED ?? 0} icon={CalendarCheck} accent="text-slate-600" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ['open', 'En cours de traitement'],
            ['closed', 'Clôturées'],
            ['all', 'Toutes'],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === key ? 'bg-acier-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="Aucune réservation dans cette vue"
          subtitle="Les demandes créées depuis le catalogue public apparaîtront ici."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Engin</th>
                <th className="px-4 py-3">Fournisseur</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((r) => {
                const actions = ADMIN_ACTIONS[r.status] ?? []
                return (
                  <tr key={r.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-semibold text-acier-800">{r.reference}</div>
                      <WorkflowSteps status={r.status} />
                    </td>
                    <td className="px-4 py-3">{equipment.find((e) => e.id === r.equipmentId)?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        // VOLTA est l'intermédiaire : c'est l'admin qui appelle le
                        // fournisseur pour qualifier et confirmer. Son numéro doit
                        // donc être sous les yeux, pas dans une autre page.
                        const supplier = users.find((u) => u.id === r.supplierId)
                        if (!supplier) return '—'
                        return (
                          <>
                            <div>{supplier.company}</div>
                            <div className="text-xs text-slate-400">{supplier.name}</div>
                            {supplier.phone && (
                              <a href={`tel:${supplier.phone.replace(/\s/g, '')}`} className="text-xs font-medium text-acier-700 hover:underline">
                                {supplier.phone}
                              </a>
                            )}
                          </>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div>{r.clientName}</div>
                      <div className="text-xs text-slate-400">{r.clientEmail}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                      {r.startDate} → {r.endDate}
                      <div className="text-slate-400">
                        {r.withOperator ? 'Opérateur' : 'Sans opérateur'} · {r.transport ? 'Transport' : 'Sans transport'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RentalStatusBadge status={r.status} />
                      {r.adminNote && <div className="mt-1 max-w-[16rem] text-xs text-slate-500">{r.adminNote}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {actions.length === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          actions.map((a) => {
                            const meta = ACTION_META[a]
                            return (
                              <Button
                                key={a}
                                size="sm"
                                tone={meta.tone}
                                onClick={() => {
                                  setNote('')
                                  setPending({ request: r, action: a })
                                }}
                              >
                                <meta.icon size={13} />
                                {meta.label}
                              </Button>
                            )
                          })
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={pending !== null}
        onClose={() => (busy ? undefined : setPending(null))}
        title={pending ? `${ACTION_META[pending.action].label} ${pending.request.reference}` : ''}
      >
        {pending && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              La réservation passera de « {RENTAL_STATUS[pending.request.status].label} » à l’étape suivante du parcours.
              {pending.action === 'cancel' && ' Cette action est définitive.'}
            </p>
            {ACTION_META[pending.action].note !== 'none' && (
              <label className="block text-sm">
                <span className="font-medium text-slate-700">
                  {pending.action === 'cancel' ? 'Motif d’annulation' : 'Note interne'}
                  {ACTION_META[pending.action].note === 'optional' && (
                    <span className="ml-1 text-xs font-normal text-slate-400">(facultatif)</span>
                  )}
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-acier-500 focus:outline-none focus:ring-2 focus:ring-acier-200"
                />
              </label>
            )}
            <div className="flex justify-end gap-2">
              <Button tone="secondary" onClick={() => setPending(null)} disabled={busy}>
                Retour
              </Button>
              <Button tone={ACTION_META[pending.action].tone} onClick={() => void run()} disabled={busy}>
                {busy ? 'Traitement…' : ACTION_META[pending.action].label}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

/** Frise minuscule du parcours : les étapes franchies, celle en cours, celles à venir. */
function WorkflowSteps({ status }: { status: RentalStatus }) {
  const index = RENTAL_ORDER.indexOf(status)
  const terminalOff = status === 'DECLINED' || status === 'CANCELLED'
  return (
    <div className="mt-1.5 flex items-center gap-0.5" aria-hidden>
      {RENTAL_ORDER.map((s, i) => (
        <span
          key={s}
          title={RENTAL_STATUS[s].label}
          className={`h-1 w-4 rounded-full ${
            terminalOff ? 'bg-slate-200' : i < index ? 'bg-acier-500' : i === index ? 'bg-btp-500' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  )
}
