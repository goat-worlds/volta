import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Calendar, Check, Clock, Package, Receipt, ShoppingCart, Truck, X,
} from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import {
  estimateTotal, formatFcfa, quoteRequestsClient, quotesClient,
  type Quote, type QuoteRequest,
} from '../../store/quotesClient'
import { Card, EmptyState, PageTitle, QuoteStatusBadge, Toast } from '../../components/ui'
import SupplierIdentity, { SupplierIdentityCompact } from '../../components/SupplierIdentity'
import { quoteRef, quoteRequestRef } from '../../lib/references'

interface Line {
  quote: Quote
  request: QuoteRequest
}

/**
 * Le panier de devis du client.
 *
 * Une demande peut recevoir plusieurs offres : présentées en tableau, elles se
 * lisaient comme un journal d'événements. Le client, lui, raisonne en panier —
 * ce qu'on lui propose, à quel prix, pour combien de jours, et ce qu'il retient.
 * Chaque ligne porte donc sa référence, son total estimé et sa décision.
 *
 * Le backend n'expose pas les devis par client mais par demande : c'est ce qui
 * garantit qu'on ne voit que les offres répondant à ses propres besoins. La page
 * agrège donc côté client.
 */
export default function ClientQuotes() {
  const { currentUser, equipment, users } = useStore()

  const [rows, setRows] = useState<Line[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'SENT' | 'ACCEPTED' | 'REJECTED'>('all')
  const [pending, setPending] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!currentUser) return
    try {
      setLoading(true)
      setError(null)

      const requests = await quoteRequestsClient.listByClient(currentUser.id)
      const results = await Promise.allSettled(requests.map((r) => quotesClient.listByRequest(r.id)))

      const collected: Line[] = []
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          res.value.forEach((q) => collected.push({ quote: q, request: requests[i] }))
        }
      })

      // Les offres les plus récentes d'abord : ce sont celles qui appellent une
      // décision.
      collected.sort((a, b) => b.quote.createdAt.localeCompare(a.quote.createdAt))
      setRows(collected)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    void load()
  }, [load])

  const flash = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 4000)
  }

  const decide = async (quote: Quote, accept: boolean) => {
    setPending(quote.id)
    try {
      if (accept) {
        await quotesClient.accept(quote.id)
        flash(`Devis ${quoteRef(quote.id, quote.createdAt)} accepté. Le fournisseur est notifié.`)
      } else {
        await quotesClient.reject(quote.id)
        flash(`Devis ${quoteRef(quote.id, quote.createdAt)} refusé.`)
      }
      await load()
    } catch (e) {
      flash(e instanceof Error ? e.message : 'L’opération a échoué.')
    } finally {
      setPending(null)
    }
  }

  const equipmentOf = (id: string) => equipment.find((e) => e.id === id)
  const supplierOf = (id: string) => users.find((u) => u.id === id)

  const visible = filter === 'all' ? rows : rows.filter((r) => r.quote.status === filter)
  const waiting = rows.filter((r) => r.quote.status === 'SENT')
  const waitingTotal = waiting.reduce(
    (sum, r) => sum + (estimateTotal(r.quote, r.request) ?? r.quote.price),
    0,
  )

  const tabs: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'SENT', label: 'À décider' },
    { key: 'ACCEPTED', label: 'Acceptés' },
    { key: 'REJECTED', label: 'Refusés' },
  ]

  return (
    <div className="space-y-6">
      <PageTitle
        title="Mon panier de devis"
        subtitle="Les offres chiffrées envoyées par les fournisseurs, prêtes à être comparées."
      />

      {waiting.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-btp-200 bg-btp-50 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-btp-500 text-white">
              <ShoppingCart size={20} />
            </span>
            <div>
              <div className="text-sm font-semibold text-btp-900">
                {waiting.length} devis en attente de votre décision
              </div>
              <div className="text-xs text-btp-700">
                Total estimé si vous acceptiez tout : {formatFcfa(waitingTotal)}
              </div>
            </div>
          </div>
          {filter !== 'SENT' && (
            <button
              onClick={() => setFilter('SENT')}
              className="rounded-lg bg-btp-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-btp-600"
            >
              Voir les devis à décider
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const count =
            t.key === 'all' ? rows.length : rows.filter((r) => r.quote.status === t.key).length
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === t.key
                  ? 'bg-acier-800 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {t.label} <span className="opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-500">Chargement…</Card>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={filter === 'all' ? 'Panier vide' : 'Aucun devis dans cette catégorie'}
          subtitle={
            filter === 'all'
              ? "Les fournisseurs n'ont pas encore répondu à vos demandes."
              : 'Changez de filtre pour voir vos autres devis.'
          }
          action={
            filter === 'all' ? (
              <Link
                to="/client/demandes/nouvelle"
                className="inline-flex items-center gap-2 rounded-lg bg-btp-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-btp-600"
              >
                Demander un devis
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {visible.map(({ quote, request }) => {
            const eq = equipmentOf(request.equipmentId)
            const total = estimateTotal(quote, request)
            const busy = pending === quote.id

            return (
              <Card key={quote.id} className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-5 py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-acier-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
                      {quoteRef(quote.id, quote.createdAt)}
                    </span>
                    <span className="text-xs text-slate-500">
                      pour la demande{' '}
                      <Link
                        to={`/client/demandes/${request.id}`}
                        className="font-mono font-medium text-acier-700 hover:underline"
                      >
                        {quoteRequestRef(request.id, request.createdAt)}
                      </Link>
                    </span>
                  </div>
                  <QuoteStatusBadge status={quote.status} />
                </div>

                <div className="flex flex-col gap-5 p-5 lg:flex-row">
                  <img
                    src={eq?.photos[0] ?? '/images/placeholders/equipment.svg'}
                    alt={eq?.name ?? 'Équipement'}
                    className="h-24 w-full shrink-0 rounded-lg object-cover lg:w-40"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-acier-900">{eq?.name ?? 'Équipement'}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      Proposé par
                      <SupplierIdentityCompact supplier={supplierOf(quote.supplierId)} />
                    </p>

                    <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-4">
                      <div className="flex items-center gap-1.5">
                        <Receipt size={13} className="shrink-0 text-slate-400" />
                        <div>
                          <dt className="text-slate-500">Prix / jour</dt>
                          <dd className="font-semibold text-acier-900">{formatFcfa(quote.price)}</dd>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Package size={13} className="shrink-0 text-slate-400" />
                        <div>
                          <dt className="text-slate-500">Quantité</dt>
                          <dd className="font-semibold text-acier-900">{request.quantity}</dd>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="shrink-0 text-slate-400" />
                        <div>
                          <dt className="text-slate-500">Période</dt>
                          <dd className="font-semibold text-acier-900">
                            {request.startDate} → {request.endDate}
                          </dd>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Truck size={13} className="shrink-0 text-slate-400" />
                        <div>
                          <dt className="text-slate-500">Mise à disposition</dt>
                          <dd className="font-semibold text-acier-900">
                            {quote.deliveryTime === 0 ? 'Immédiate' : `${quote.deliveryTime} j`}
                          </dd>
                        </div>
                      </div>
                    </dl>

                    {quote.conditions && (
                      <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
                        {quote.conditions}
                      </p>
                    )}

                    {quote.validUntil && quote.status === 'SENT' && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
                        <Clock size={13} />
                        Offre valable jusqu’au {quote.validUntil}
                      </p>
                    )}

                    {/* VOLTA n'encaisse rien : une fois l'offre retenue, les
                        coordonnées du fournisseur sont ce qui permet au client
                        d'organiser la location. */}
                    {quote.status === 'ACCEPTED' && (
                      <SupplierIdentity
                        supplier={supplierOf(quote.supplierId)}
                        title="Contactez le fournisseur"
                        className="mt-3 border-emerald-200 bg-emerald-50/40"
                      />
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col justify-between gap-3 border-slate-100 lg:w-52 lg:border-l lg:pl-5">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Total estimé</div>
                      <div className="text-xl font-bold text-acier-900">
                        {total === null ? formatFcfa(quote.price) : formatFcfa(total)}
                      </div>
                      {total !== null && (
                        <div className="text-[11px] text-slate-400">
                          pour la période et la quantité demandées
                        </div>
                      )}
                    </div>

                    {quote.status === 'SENT' ? (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => decide(quote, true)}
                          disabled={busy}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <Check size={15} />
                          {busy ? 'Envoi…' : 'Accepter'}
                        </button>
                        <button
                          onClick={() => decide(quote, false)}
                          disabled={busy}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                        >
                          <X size={15} />
                          Refuser
                        </button>
                      </div>
                    ) : (
                      <Link
                        to={`/client/demandes/${request.id}`}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-acier-800 transition hover:border-btp-400 hover:text-btp-600"
                      >
                        Voir la demande <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <Toast message={toast} />
    </div>
  )
}
