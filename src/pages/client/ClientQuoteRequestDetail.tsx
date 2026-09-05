import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, X, Receipt, AlertCircle, Loader2 } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import {
  quoteRequestsClient, quotesClient, estimateTotal, formatFcfa,
  type QuoteRequest, type Quote,
} from '../../store/quotesClient'
import { Card, EmptyState, PageTitle, QuoteStatusBadge } from '../../components/ui'
import SupplierIdentity, { SupplierIdentityCompact } from '../../components/SupplierIdentity'
import { quoteRef } from '../../lib/references'

/**
 * Détail d'une demande et comparaison des devis reçus.
 *
 * Les offres sont mises côte à côte plutôt qu'en liste : comparer trois prix
 * empilés oblige à mémoriser, alors que la décision se prend d'un regard quand
 * les critères s'alignent.
 *
 * L'acceptation passe par le backend, qui vérifie la propriété, le statut et la
 * validité, puis crée la location dans la même transaction. Le front ne fait
 * que refléter ce qu'il a répondu.
 */
export default function ClientQuoteRequestDetail() {
  const { id } = useParams<{ id: string }>()
  const { equipment, users, reload } = useStore()

  const [request, setRequest] = useState<QuoteRequest | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const [req, qs] = await Promise.all([
        quoteRequestsClient.getById(id),
        quotesClient.listByRequest(id),
      ])
      setRequest(req)
      setQuotes(qs)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { void load() }, [load])

  /**
   * Accepte ou refuse une offre.
   *
   * Les données sont rechargées depuis le serveur après l'action plutôt que
   * modifiées localement : l'acceptation change aussi le statut de la demande et
   * crée une location, que le front n'a pas à deviner.
   */
  const decide = async (quoteId: string, decision: 'accept' | 'reject') => {
    setActing(quoteId)
    setActionError(null)
    try {
      if (decision === 'accept') {
        await quotesClient.accept(quoteId)
      } else {
        await quotesClient.reject(quoteId)
      }
      await load()
      // Le store porte les locations : une acceptation vient d'en créer une.
      void reload()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "L'opération a échoué")
    } finally {
      setActing(null)
    }
  }

  if (loading) {
    return <Card className="p-10 text-center text-sm text-slate-500">Chargement…</Card>
  }

  if (error || !request) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Demande introuvable"
        subtitle={error ?? "Cette demande n'existe pas ou ne vous appartient pas."}
        action={
          <Link to="/client/demandes" className="text-sm font-medium text-blue-600 hover:underline">
            Retour à mes demandes
          </Link>
        }
      />
    )
  }

  const eq = equipment.find((e) => e.id === request.equipmentId)
  const decided = request.status !== 'PENDING'
  const supplierOf = (id: string) => users.find((u) => u.id === id)
  const acceptedQuote = quotes.find((q) => q.status === 'ACCEPTED')

  /** Critères comparés, dans l'ordre où ils pèsent sur la décision. */
  const criteria: { label: string; render: (q: Quote) => string }[] = [
    { label: 'Prix par jour', render: (q) => formatFcfa(q.price) },
    {
      label: 'Total estimé',
      render: (q) => {
        const total = estimateTotal(q, request)
        return total === null ? '—' : formatFcfa(total)
      },
    },
    {
      label: 'Délai de mise à disposition',
      render: (q) => (q.deliveryTime === 0 ? 'Immédiat' : `${q.deliveryTime} jour${q.deliveryTime > 1 ? 's' : ''}`),
    },
    { label: 'Valide jusqu’au', render: (q) => q.validUntil || '—' },
    { label: 'Conditions', render: (q) => q.conditions || '—' },
  ]

  return (
    <div className="space-y-6">
      <Link
        to="/client/demandes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={15} />
        Mes demandes
      </Link>

      <PageTitle
        title={eq?.name ?? 'Demande de devis'}
        subtitle={`Du ${request.startDate} au ${request.endDate} · ${request.quantity} unité${request.quantity > 1 ? 's' : ''}`}
        actions={<QuoteStatusBadge status={request.status} />}
      />

      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Détail de la demande</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Équipement', eq?.name ?? request.equipmentId],
            ['Période', `${request.startDate} → ${request.endDate}`],
            ['Quantité', String(request.quantity)],
            ['Demandé le', request.createdAt],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
        {request.message && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Besoin exprimé</dt>
            <dd className="mt-1 text-sm text-slate-700">{request.message}</dd>
          </div>
        )}
      </Card>

      {actionError && (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}

      {/* Offre retenue : le client passe de la comparaison à l'organisation de
          la location, et c'est le fournisseur qu'il lui faut joindre. */}
      {acceptedQuote && (
        <div className="grid gap-4 sm:grid-cols-[1fr_18rem]">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-emerald-800">
              <Check size={16} />
              Offre retenue — {formatFcfa(acceptedQuote.price)} / jour
            </div>
            <p className="mt-1 text-xs text-emerald-700">
              VOLTA ne prend ni réservation ni paiement : convenez directement des modalités
              avec le fournisseur.
            </p>
          </div>
          <SupplierIdentity
            supplier={supplierOf(acceptedQuote.supplierId)}
            title="Contactez le fournisseur"
          />
        </div>
      )}

      {quotes.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aucun devis reçu"
          subtitle="Le fournisseur n'a pas encore répondu à votre demande."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Comparaison des offres <span className="text-slate-500">({quotes.length})</span>
            </h2>
            {decided && (
              <p className="mt-1 text-xs text-slate-500">
                Cette demande est close : une offre a déjà été retenue.
              </p>
            )}
          </div>

          {/* Le tableau défile horizontalement plutôt que de comprimer les
              colonnes : trois offres restent lisibles, dix aussi. */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Critère
                  </th>
                  {quotes.map((q) => (
                    <th key={q.id} className="px-5 py-3 text-left">
                      {/* Une offre se juge autant sur qui la propose que sur son
                          prix : la colonne porte donc le fournisseur, la
                          référence n'étant qu'un repère pour la citer. */}
                      <SupplierIdentityCompact supplier={supplierOf(q.supplierId)} />
                      <div className="mt-1 font-mono text-[11px] font-normal text-slate-400">
                        {quoteRef(q.id, q.createdAt)}
                      </div>
                      <div className="mt-1"><QuoteStatusBadge status={q.status} /></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criteria.map((c) => (
                  <tr key={c.label}>
                    <td className="px-5 py-3 text-xs uppercase tracking-wide text-slate-500">{c.label}</td>
                    {quotes.map((q) => (
                      <td key={q.id} className="px-5 py-3 text-slate-900">{c.render(q)}</td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td className="px-5 py-4 text-xs uppercase tracking-wide text-slate-500">Décision</td>
                  {quotes.map((q) => (
                    <td key={q.id} className="px-5 py-4">
                      {q.status !== 'SENT' ? (
                        <span className="text-xs text-slate-500">
                          {q.status === 'ACCEPTED' ? 'Offre retenue' : 'Offre refusée'}
                        </span>
                      ) : decided ? (
                        <span className="text-xs text-slate-500">Demande close</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => void decide(q.id, 'accept')}
                            disabled={acting !== null}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {acting === q.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                            Accepter
                          </button>
                          <button
                            onClick={() => void decide(q.id, 'reject')}
                            disabled={acting !== null}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-50"
                          >
                            <X size={13} />
                            Refuser
                          </button>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
