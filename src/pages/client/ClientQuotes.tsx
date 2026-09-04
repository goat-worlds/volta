import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, ArrowRight } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import {
  quoteRequestsClient, quotesClient, formatFcfa,
  type QuoteRequest, type Quote,
} from '../../store/quotesClient'
import { Card, EmptyState, PageTitle, QuoteStatusBadge } from '../../components/ui'

/**
 * Tous les devis reçus par le client, toutes demandes confondues.
 *
 * Le backend n'expose pas les devis par client mais par demande : c'est ce qui
 * garantit qu'on ne voit que les offres répondant à ses propres besoins. La page
 * agrège donc côté client, en gardant le lien vers la demande d'origine — c'est
 * là que la comparaison a du sens.
 */
export default function ClientQuotes() {
  const { currentUser, equipment } = useStore()

  const [rows, setRows] = useState<{ quote: Quote; request: QuoteRequest }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'SENT' | 'ACCEPTED' | 'REJECTED'>('all')

  useEffect(() => {
    if (!currentUser) return
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const requests = await quoteRequestsClient.listByClient(currentUser.id)
        if (cancelled) return

        const results = await Promise.allSettled(
          requests.map((r) => quotesClient.listByRequest(r.id))
        )
        if (cancelled) return

        const collected: { quote: Quote; request: QuoteRequest }[] = []
        results.forEach((res, i) => {
          if (res.status === 'fulfilled') {
            res.value.forEach((q) => collected.push({ quote: q, request: requests[i] }))
          }
        })

        // Les offres les plus récentes d'abord : c'est celles qui appellent une
        // décision.
        collected.sort((a, b) => b.quote.createdAt.localeCompare(a.quote.createdAt))
        setRows(collected)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Chargement impossible')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [currentUser])

  const equipmentName = (id: string) => equipment.find((e) => e.id === id)?.name ?? 'Équipement'
  const visible = filter === 'all' ? rows : rows.filter((r) => r.quote.status === filter)

  const tabs: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'SENT', label: 'En attente de décision' },
    { key: 'ACCEPTED', label: 'Acceptés' },
    { key: 'REJECTED', label: 'Refusés' },
  ]

  return (
    <div className="space-y-6">
      <PageTitle
        title="Mes devis reçus"
        subtitle="Les offres chiffrées envoyées par les fournisseurs"
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const count = t.key === 'all'
            ? rows.length
            : rows.filter((r) => r.quote.status === t.key).length
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === t.key
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {t.label} <span className="opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-500">Chargement…</Card>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={filter === 'all' ? 'Aucun devis reçu' : 'Aucun devis dans cette catégorie'}
          subtitle={
            filter === 'all'
              ? "Les fournisseurs n'ont pas encore répondu à vos demandes."
              : 'Changez de filtre pour voir vos autres devis.'
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Équipement</th>
                  <th className="px-5 py-3 font-medium">Prix / jour</th>
                  <th className="px-5 py-3 font-medium">Délai</th>
                  <th className="px-5 py-3 font-medium">Validité</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map(({ quote, request }) => (
                  <tr key={quote.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {equipmentName(request.equipmentId)}
                    </td>
                    <td className="px-5 py-3 text-slate-900">{formatFcfa(quote.price)}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {quote.deliveryTime === 0 ? 'Immédiat' : `${quote.deliveryTime} j`}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{quote.validUntil || '—'}</td>
                    <td className="px-5 py-3"><QuoteStatusBadge status={quote.status} /></td>
                    <td className="px-5 py-3 text-right">
                      {/* Le lien mène à la demande, pas au devis : c'est là que
                          les offres se comparent et se tranchent. */}
                      <Link
                        to={`/client/demandes/${request.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                      >
                        Comparer <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-slate-100 md:hidden">
            {visible.map(({ quote, request }) => (
              <li key={quote.id}>
                <Link to={`/client/demandes/${request.id}`} className="block p-4 transition hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-900">{equipmentName(request.equipmentId)}</p>
                    <QuoteStatusBadge status={quote.status} />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{formatFcfa(quote.price)} / jour</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Délai {quote.deliveryTime === 0 ? 'immédiat' : `${quote.deliveryTime} j`}
                    {quote.validUntil ? ` · valide jusqu'au ${quote.validUntil}` : ''}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
