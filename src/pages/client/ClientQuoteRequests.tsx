import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Plus, ArrowRight } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { quoteRequestsClient, quotesClient, type QuoteRequest } from '../../store/quotesClient'
import { Card, EmptyState, PageTitle, QuoteStatusBadge } from '../../components/ui'

/**
 * Liste des demandes de devis du client.
 *
 * Le nombre de devis reçus est affiché par demande : c'est l'information qui
 * décide de l'action suivante — une demande sans réponse s'attend, une demande
 * avec plusieurs offres se compare.
 */
export default function ClientQuoteRequests() {
  const { currentUser, equipment } = useStore()

  const [requests, setRequests] = useState<QuoteRequest[]>([])
  const [quoteCounts, setQuoteCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'ACCEPTED' | 'DECLINED'>('all')

  useEffect(() => {
    if (!currentUser) return
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const list = await quoteRequestsClient.listByClient(currentUser.id)
        if (cancelled) return
        setRequests(list)

        const results = await Promise.allSettled(
          list.map((r) => quotesClient.listByRequest(r.id))
        )
        if (cancelled) return

        const counts: Record<string, number> = {}
        results.forEach((res, i) => {
          // Un décompte indisponible reste à zéro plutôt que de masquer la ligne.
          counts[list[i].id] = res.status === 'fulfilled' ? res.value.length : 0
        })
        setQuoteCounts(counts)
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

  const visible = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  const tabs: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'PENDING', label: 'En attente' },
    { key: 'ACCEPTED', label: 'Acceptées' },
    { key: 'DECLINED', label: 'Refusées' },
  ]

  return (
    <div className="space-y-6">
      <PageTitle
        title="Mes demandes de devis"
        subtitle="Suivez vos demandes et comparez les offres reçues"
        actions={
          <Link
            to="/client/demandes/nouvelle"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={16} />
            Nouvelle demande
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const count = t.key === 'all'
            ? requests.length
            : requests.filter((r) => r.status === t.key).length
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-500">Chargement…</Card>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Package}
          title={filter === 'all' ? 'Aucune demande' : 'Aucune demande dans cette catégorie'}
          subtitle={
            filter === 'all'
              ? "Demandez un devis depuis la fiche d'un équipement du catalogue."
              : 'Changez de filtre pour voir vos autres demandes.'
          }
          action={
            filter === 'all' ? (
              <Link
                to="/client/catalogue"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Parcourir le catalogue
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          {/* Le tableau bascule en cartes sous md : une grille de sept colonnes
              devient illisible sur un écran de téléphone. */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Équipement</th>
                  <th className="px-5 py-3 font-medium">Période</th>
                  <th className="px-5 py-3 font-medium">Quantité</th>
                  <th className="px-5 py-3 font-medium">Devis</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((r) => (
                  <tr key={r.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{equipmentName(r.equipmentId)}</td>
                    <td className="px-5 py-3 text-slate-600">{r.startDate} → {r.endDate}</td>
                    <td className="px-5 py-3 text-slate-600">{r.quantity}</td>
                    <td className="px-5 py-3 text-slate-600">{quoteCounts[r.id] ?? 0}</td>
                    <td className="px-5 py-3"><QuoteStatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/client/demandes/${r.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                      >
                        Voir <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-slate-100 md:hidden">
            {visible.map((r) => (
              <li key={r.id}>
                <Link to={`/client/demandes/${r.id}`} className="block p-4 transition hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-900">{equipmentName(r.equipmentId)}</p>
                    <QuoteStatusBadge status={r.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {r.startDate} → {r.endDate} · {r.quantity} unité{r.quantity > 1 ? 's' : ''}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{quoteCounts[r.id] ?? 0} devis reçu(s)</p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
