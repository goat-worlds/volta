import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Receipt } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import {
  quoteRequestsClient,
  quotesClient,
  formatFcfa,
  type Quote,
  type QuoteRequest,
} from '../../store/quotesClient'
import { Card, EmptyState, PageTitle, QuoteStatusBadge, StatCard } from '../../components/ui'

/**
 * Devis émis par le fournisseur, et ce que le client en a fait.
 *
 * Un devis envoyé disparaissait de la vue : le fournisseur ne savait pas s'il
 * avait été retenu. C'est pourtant la seule information qui compte pour lui
 * une fois l'offre partie.
 */
export default function SupplierQuotes() {
  const { currentUser, equipment } = useStore()
  const supplierId = currentUser?.id

  const [quotes, setQuotes] = useState<Quote[]>([])
  const [requests, setRequests] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supplierId) return
    let cancelled = false
    void (async () => {
      try {
        // Les demandes accompagnent les devis : sans elles, on afficherait un
        // montant sans savoir pour quel engin ni pour quelles dates.
        const [q, r] = await Promise.all([
          quotesClient.listBySupplier(supplierId),
          quoteRequestsClient.listBySupplier(supplierId),
        ])
        if (!cancelled) {
          setQuotes(q)
          setRequests(r)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supplierId])

  const requestById = useMemo(() => {
    const map = new Map<string, QuoteRequest>()
    requests.forEach((r) => map.set(r.id, r))
    return map
  }, [requests])

  const accepted = quotes.filter((q) => q.status === 'ACCEPTED').length
  const waiting = quotes.filter((q) => q.status === 'SENT').length

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" />
        Chargement de vos devis…
      </div>
    )
  }

  return (
    <div>
      <PageTitle title="Mes devis" subtitle="Les offres que vous avez envoyées et leur suite." />

      {quotes.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aucun devis envoyé"
          subtitle="Répondez à une demande pour qu'elle apparaisse ici."
          action={
            <Link
              to="/supplier/demandes"
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500"
            >
              Voir les demandes
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Devis envoyés" value={quotes.length} accent="text-slate-900" />
            <StatCard label="En attente de réponse" value={waiting} accent="text-amber-600" />
            <StatCard label="Acceptés" value={accepted} accent="text-emerald-600" />
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Engin</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Période</th>
                  <th className="px-4 py-3">Prix / jour</th>
                  <th className="px-4 py-3">Valable jusqu'au</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotes.map((q) => {
                  const r = requestById.get(q.quoteRequestId)
                  const eq = equipment.find((e) => e.id === r?.equipmentId)
                  return (
                    <tr key={q.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{eq?.name ?? '—'}</td>
                      <td className="px-4 py-3">{r?.clientName ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {r ? `${r.startDate} → ${r.endDate}` : '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums">{formatFcfa(q.price)}</td>
                      <td className="px-4 py-3 text-slate-600">{q.validUntil}</td>
                      <td className="px-4 py-3">
                        <QuoteStatusBadge status={q.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}
