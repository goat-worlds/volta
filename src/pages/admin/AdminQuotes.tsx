import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, Phone, XCircle } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useLiveResource } from '../../store/useLiveResource'
import { useToast } from '../../components/feedback/Toaster'
import { Button, Card, CopyRef, EmptyState, Modal, PageTitle, QuoteStatusBadge, StatCard, fmtPrice } from '../../components/ui'
import { quoteRequestsClient, type Quote, type QuoteRequest } from '../../store/quotesClient'
import { quoteRef, quoteRequestRef } from '../../lib/references'

/**
 * Administration — Devis.
 *
 * Une demande de devis n'atteint le fournisseur qu'après ce passage. VOLTA lit
 * d'abord qui demande, son numéro, quel engin et pour quand, puis transmet.
 * Avant ce geste, le fournisseur ignore que la demande existe : c'est ce qui
 * fait de VOLTA l'intermédiaire, et non un annuaire.
 *
 * La file se traite dans l'ordre d'arrivée : la demande la plus ancienne est
 * en tête et se distingue des autres, pour qu'on ne saute personne. Les
 * demandes déjà transmises suivent, avec les devis que le fournisseur y a
 * répondus, pour le suivi.
 */
export default function AdminQuotes() {
  const { equipment, users } = useStore()
  const toast = useToast()
  const requests = useLiveResource<QuoteRequest[]>('/quote-requests')
  const quotes = useLiveResource<Quote[]>('/quotes')
  const [pendingReject, setPendingReject] = useState<QuoteRequest | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const all = useMemo(() => requests.data ?? [], [requests.data])
  const allQuotes = useMemo(() => quotes.data ?? [], [quotes.data])

  // FIFO : la plus ancienne d'abord. createdAt est un horodatage ISO, qui se
  // compare comme du texte.
  const toValidate = useMemo(
    () => all.filter((r) => r.status === 'AWAITING_VALIDATION').sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [all],
  )
  const others = useMemo(
    () => all.filter((r) => r.status !== 'AWAITING_VALIDATION').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [all],
  )

  const equipmentName = (id: string) => equipment.find((e) => e.id === id)?.name ?? '—'
  const supplierOf = (id: string) => users.find((u) => u.id === id)
  const quotesFor = (requestId: string) => allQuotes.filter((q) => q.quoteRequestId === requestId)

  const approve = async (r: QuoteRequest) => {
    setBusy(r.id)
    try {
      const updated = await quoteRequestsClient.approve(r.id)
      requests.patch((c) => (c ?? []).map((x) => (x.id === r.id ? updated : x)))
      toast.success('Demande transmise', `${r.clientName} — ${equipmentName(r.equipmentId)}. Le fournisseur peut répondre.`)
    } catch (err) {
      toast.fromError(err, 'Transmission impossible')
    } finally {
      setBusy(null)
    }
  }

  const reject = async () => {
    if (!pendingReject) return
    setBusy(pendingReject.id)
    try {
      const updated = await quoteRequestsClient.reject(pendingReject.id, reason)
      requests.patch((c) => (c ?? []).map((x) => (x.id === pendingReject.id ? updated : x)))
      toast.info('Demande écartée', 'Le client est prévenu.')
      setPendingReject(null)
      setReason('')
    } catch (err) {
      toast.fromError(err, 'Refus impossible')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Devis"
        subtitle="Chaque demande passe par VOLTA avant d'atteindre le fournisseur."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="À valider" value={toValidate.length} icon={Clock} accent={toValidate.length > 0 ? 'text-btp-600' : undefined} />
        <StatCard label="Transmises au fournisseur" value={all.filter((r) => r.status === 'PENDING').length} />
        <StatCard label="Devis reçus" value={allQuotes.length} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          File de validation — dans l'ordre d'arrivée
        </h2>
        {toValidate.length === 0 ? (
          <EmptyState title="Aucune demande en attente" subtitle="Les nouvelles demandes de devis apparaîtront ici, la plus ancienne en tête." />
        ) : (
          <div className="grid gap-3">
            {toValidate.map((r, index) => {
              const first = index === 0
              const supplier = supplierOf(r.supplierId)
              return (
                <Card
                  key={r.id}
                  className={`p-4 ${first ? 'border-2 border-btp-500 bg-btp-50/40 shadow-md' : ''}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {first && (
                          <span className="rounded-full bg-btp-500 px-2.5 py-0.5 text-xs font-bold uppercase text-white">
                            À traiter en premier
                          </span>
                        )}
                        <CopyRef value={quoteRequestRef(r.id)} />
                        <QuoteStatusBadge status={r.status} />
                      </div>

                      <div className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                        <div>
                          <div className="text-xs uppercase tracking-wider text-slate-400">Client</div>
                          <div className="font-semibold">{r.clientName || '—'}</div>
                          {r.clientPhone && (
                            <a href={`tel:${r.clientPhone.replace(/\s/g, '')}`} className="mt-0.5 inline-flex items-center gap-1.5 font-medium text-acier-700 hover:underline">
                              <Phone size={13} /> {r.clientPhone}
                            </a>
                          )}
                          <div className="text-xs text-slate-500">{r.clientEmail}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-slate-400">Engin demandé</div>
                          <div className="font-semibold">{equipmentName(r.equipmentId)}</div>
                          <div className="text-xs text-slate-500">
                            Fournisseur : {supplier?.company ?? '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-slate-400">Période</div>
                          <div>{r.startDate} → {r.endDate} · quantité {r.quantity}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-slate-400">Reçue</div>
                          <div className="inline-flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" /> {fmtDateTime(r.createdAt)}
                          </div>
                        </div>
                        {r.message && (
                          <div className="sm:col-span-2">
                            <div className="text-xs uppercase tracking-wider text-slate-400">Message du client</div>
                            <div className="text-slate-700">{r.message}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      <Button tone="success" disabled={busy === r.id} onClick={() => approve(r)}>
                        <CheckCircle2 size={15} /> Autoriser le fournisseur
                      </Button>
                      <Button
                        tone="ghost"
                        disabled={busy === r.id}
                        onClick={() => {
                          setReason('')
                          setPendingReject(r)
                        }}
                      >
                        <XCircle size={15} /> Écarter
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Transmises et traitées
        </h2>
        {others.length === 0 ? (
          <EmptyState title="Rien encore" subtitle="Les demandes transmises et les devis reçus apparaîtront ici." />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Demande</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Engin</th>
                  <th className="px-4 py-3">Fournisseur</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Devis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {others.map((r) => {
                  const supplier = supplierOf(r.supplierId)
                  const qs = quotesFor(r.id)
                  return (
                    <tr key={r.id} className="align-top">
                      <td className="px-4 py-3">
                        <CopyRef value={quoteRequestRef(r.id)} />
                        <div className="text-xs text-slate-400">{fmtDateTime(r.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{r.clientName}</div>
                        <div className="text-xs text-slate-400">{r.clientPhone}</div>
                      </td>
                      <td className="px-4 py-3">{equipmentName(r.equipmentId)}</td>
                      <td className="px-4 py-3">
                        <div>{supplier?.company ?? '—'}</div>
                        <div className="text-xs text-slate-400">{supplier?.phone}</div>
                      </td>
                      <td className="px-4 py-3"><QuoteStatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        {qs.length === 0 ? (
                          <span className="text-xs text-slate-400">En attente du fournisseur</span>
                        ) : (
                          qs.map((q) => (
                            <div key={q.id} className="text-xs">
                              <span className="font-mono text-[11px] text-slate-400">{quoteRef(q.id)}</span> <span className="font-semibold">{fmtPrice(q.price)}</span> · {q.deliveryTime} j ·{' '}
                              <QuoteStatusBadge status={q.status} />
                            </div>
                          ))
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        )}
      </section>

      <Modal open={pendingReject !== null} onClose={() => setPendingReject(null)} title="Écarter cette demande">
        <div className="grid gap-3 text-sm">
          <p className="text-slate-600">
            Le fournisseur ne la verra jamais. Le client sera prévenu, avec le motif ci-dessous s'il est renseigné.
          </p>
          <textarea
            className="w-full rounded-lg border border-slate-300 p-2 text-sm"
            rows={3}
            placeholder="Motif (facultatif) : doublon, coordonnées invalides, besoin hors périmètre…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button tone="ghost" onClick={() => setPendingReject(null)}>Annuler</Button>
            <Button tone="danger" disabled={busy !== null} onClick={reject}>Écarter la demande</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/** Horodatage ISO ou simple date, rendu lisible ; une valeur illisible s'affiche telle quelle. */
function fmtDateTime(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const date = d.toLocaleDateString('fr-FR')
  return value.includes('T') ? `${date} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : date
}
