import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Loader2, Inbox, Send } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import {
  quoteRequestsClient,
  quotesClient,
  formatFcfa,
  type Quote,
  type QuoteRequest,
} from '../../store/quotesClient'
import { Card, EmptyState, Modal, PageTitle, QuoteStatusBadge, Toast } from '../../components/ui'

/**
 * Demandes de devis reçues, et réponse du fournisseur.
 *
 * C'est le maillon qui manquait. Le client déposait bien une demande, le
 * serveur la stockait et notifiait le fournisseur — mais l'espace fournisseur
 * n'affichait que les `rental-requests`, une autre table. La demande partait
 * donc dans le vide : rien ne s'affichait, et le client attendait un devis que
 * personne ne pouvait rédiger.
 *
 * La demande de location, elle, naît de l'acceptation d'un devis : elle est la
 * fin du parcours, pas son début.
 */

/** Nombre de jours facturés, bornes incluses. */
function rentalDays(request: QuoteRequest): number | null {
  const start = Date.parse(request.startDate)
  const end = Date.parse(request.endDate)
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1)
}

/** Par défaut, un devis reste valable deux semaines. */
function defaultValidUntil(): string {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().slice(0, 10)
}

export default function SupplierQuoteRequests() {
  const { currentUser, equipment } = useStore()
  const supplierId = currentUser?.id

  const [requests, setRequests] = useState<QuoteRequest[]>([])
  const [myQuotes, setMyQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [replyTo, setReplyTo] = useState<QuoteRequest | null>(null)
  const [price, setPrice] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('2')
  const [conditions, setConditions] = useState('')
  const [validUntil, setValidUntil] = useState(defaultValidUntil())
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supplierId) return
    setLoading(true)
    try {
      // Les deux listes servent ensemble : sans les devis déjà émis, on
      // proposerait de répondre une seconde fois à une demande traitée.
      const [r, q] = await Promise.all([
        quoteRequestsClient.listBySupplier(supplierId),
        quotesClient.listBySupplier(supplierId),
      ])
      setRequests(r)
      setMyQuotes(q)
      setError(null)
    } catch {
      setError('Impossible de charger les demandes de devis.')
    } finally {
      setLoading(false)
    }
  }, [supplierId])

  useEffect(() => {
    void load()
  }, [load])

  const quoteByRequest = useMemo(() => {
    const map = new Map<string, Quote>()
    myQuotes.forEach((q) => map.set(q.quoteRequestId, q))
    return map
  }, [myQuotes])

  const showToast = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 4000)
  }

  const openReply = (request: QuoteRequest) => {
    const eq = equipment.find((e) => e.id === request.equipmentId)
    setReplyTo(request)
    // Le prix catalogue de l'engin sert de point de départ : le fournisseur
    // ajuste plutôt que de repartir d'un champ vide.
    setPrice(eq ? String(eq.pricePerDay) : '')
    setDeliveryTime('2')
    setConditions('')
    setValidUntil(defaultValidUntil())
    setFormError(null)
  }

  const send = async () => {
    if (!replyTo) return
    const amount = Number(price)
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Indiquez un prix journalier supérieur à zéro.')
      return
    }
    setSending(true)
    setFormError(null)
    try {
      await quotesClient.create({
        quoteRequestId: replyTo.id,
        price: Math.round(amount),
        deliveryTime: Number(deliveryTime) || 0,
        conditions,
        validUntil,
      })
      setReplyTo(null)
      await load()
      showToast('Devis envoyé au client ✔')
    } catch {
      setFormError("L'envoi a échoué. La demande a peut-être déjà été tranchée.")
    } finally {
      setSending(false)
    }
  }

  const pending = requests.filter((r) => !quoteByRequest.has(r.id) && r.status === 'PENDING')

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" />
        Chargement des demandes…
      </div>
    )
  }

  return (
    <div>
      <PageTitle
        title="Demandes de devis"
        subtitle={
          pending.length > 0
            ? `${pending.length} demande${pending.length > 1 ? 's' : ''} attend${pending.length > 1 ? 'ent' : ''} votre réponse.`
            : 'Les demandes envoyées par les clients pour vos engins.'
        }
      />

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Aucune demande reçue"
          subtitle="Les clients qui s'intéressent à vos engins publiés apparaîtront ici."
        />
      ) : (
        <div className="grid gap-4">
          {requests.map((r) => {
            const eq = equipment.find((e) => e.id === r.equipmentId)
            const mine = quoteByRequest.get(r.id)
            const days = rentalDays(r)
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{eq?.name ?? 'Engin retiré'}</span>
                      <QuoteStatusBadge status={r.status} />
                      {mine && <QuoteStatusBadge status={mine.status} />}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Reçue le {r.createdAt} · quantité {r.quantity}
                    </div>
                  </div>

                  {mine ? (
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{formatFcfa(mine.price)} / jour</div>
                      <div className="text-xs text-slate-500">Devis envoyé le {mine.createdAt}</div>
                    </div>
                  ) : r.status === 'PENDING' ? (
                    <button
                      onClick={() => openReply(r)}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-500"
                    >
                      <Send size={15} />
                      Répondre
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Demande close</span>
                  )}
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-xs text-slate-500">Période</dt>
                    <dd className="font-medium text-slate-900">
                      {r.startDate} → {r.endDate}
                      {days && <span className="ml-1 text-xs font-normal text-slate-500">({days} j)</span>}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Client</dt>
                    <dd className="font-medium text-slate-900">{r.clientName || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Téléphone</dt>
                    <dd className="font-medium text-slate-900">{r.clientPhone || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Email</dt>
                    <dd className="truncate font-medium text-slate-900">{r.clientEmail || '—'}</dd>
                  </div>
                </dl>

                {r.message && (
                  <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm italic text-slate-600">« {r.message} »</p>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={replyTo !== null} onClose={() => setReplyTo(null)} title="Envoyer un devis">
        {replyTo && (
          <div className="grid gap-4">
            <p className="text-sm text-slate-600">
              {equipment.find((e) => e.id === replyTo.equipmentId)?.name} — {replyTo.startDate} → {replyTo.endDate}
              {(() => {
                const d = rentalDays(replyTo)
                const amount = Number(price)
                if (!d || !Number.isFinite(amount) || amount <= 0) return null
                return (
                  <span className="mt-1 block text-xs text-slate-500">
                    Soit {formatFcfa(Math.round(amount) * d * Math.max(1, replyTo.quantity))} au total
                    ({d} jour{d > 1 ? 's' : ''} × {replyTo.quantity} engin{replyTo.quantity > 1 ? 's' : ''})
                  </span>
                )
              })()}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Prix par jour (FCFA)</label>
                <input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Mise à disposition (jours)</label>
                <input
                  type="number"
                  min={0}
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Valable jusqu'au</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Conditions</label>
              <textarea
                rows={3}
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="Transport, carburant, opérateur, caution…"
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReplyTo(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                disabled={sending}
                onClick={() => void send()}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-500 disabled:opacity-60"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {sending ? 'Envoi…' : 'Envoyer le devis'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Toast message={toast} />
    </div>
  )
}
