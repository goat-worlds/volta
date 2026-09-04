import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Receipt, CalendarCheck, CheckCircle2, ArrowRight, Plus } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { quoteRequestsClient, quotesClient, type QuoteRequest, type Quote } from '../../store/quotesClient'
import { Card, StatCard, EmptyState, PageTitle, QuoteStatusBadge } from '../../components/ui'

/**
 * Tableau de bord client.
 *
 * Toutes les valeurs viennent de l'API : afficher des compteurs figés donnerait
 * l'illusion d'une activité inexistante, et masquerait précisément ce que le
 * client vient vérifier.
 *
 * Les devis sont chargés demande par demande car le backend les expose par
 * demande, pas globalement par client — c'est ce qui garantit qu'un client ne
 * voit que les offres qui répondent à ses propres besoins.
 */
export default function ClientDashboard() {
  const { currentUser, equipment } = useStore()

  const [requests, setRequests] = useState<QuoteRequest[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) return
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const myRequests = await quoteRequestsClient.listByClient(currentUser.id)
        if (cancelled) return
        setRequests(myRequests)

        // Chargement en parallèle : enchaîner les appels rendrait la page lente
        // dès une poignée de demandes.
        const results = await Promise.allSettled(
          myRequests.map((r) => quotesClient.listByRequest(r.id))
        )
        if (cancelled) return

        // Une demande dont les devis sont indisponibles ne doit pas faire
        // échouer tout le tableau de bord.
        setQuotes(results.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])))
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Chargement impossible')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [currentUser])

  if (!currentUser) {
    return <EmptyState title="Session expirée" subtitle="Reconnectez-vous pour accéder à votre espace." />
  }

  const pending = requests.filter((r) => r.status === 'PENDING')
  const accepted = quotes.filter((q) => q.status === 'ACCEPTED')
  const awaiting = quotes.filter((q) => q.status === 'SENT')

  const equipmentName = (id: string) =>
    equipment.find((e) => e.id === id)?.name ?? 'Équipement'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle
          title={`Bonjour, ${currentUser.name}`}
          subtitle="Voici un aperçu de votre activité"
        />
        <Link
          to="/client/demandes/nouvelle"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Nouvelle demande
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Demandes en cours" value={loading ? '—' : String(pending.length)} icon={Package} />
        <StatCard label="Devis reçus" value={loading ? '—' : String(awaiting.length)} icon={Receipt} />
        <StatCard label="Devis acceptés" value={loading ? '—' : String(accepted.length)} icon={CheckCircle2} />
        <StatCard label="Demandes totales" value={loading ? '—' : String(requests.length)} icon={CalendarCheck} />
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Demandes récentes</h2>
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Chargement…</p>
        ) : requests.length === 0 ? (
          <EmptyState
            title="Aucune demande pour le moment"
            subtitle="Parcourez le catalogue et demandez un devis pour l'équipement qui vous intéresse."
            icon={Package}
            action={
              <Link
                to="/client/catalogue"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Parcourir le catalogue
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {requests.slice(0, 5).map((r) => {
              const count = quotes.filter((q) => q.quoteRequestId === r.id).length
              return (
                <li key={r.id}>
                  <Link
                    to={`/client/demandes/${r.id}`}
                    className="flex items-center justify-between gap-4 py-3 transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{equipmentName(r.equipmentId)}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {r.startDate} au {r.endDate} · {r.quantity} unité{r.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {count} devis
                      </span>
                      <QuoteStatusBadge status={r.status} />
                      <ArrowRight size={16} className="text-slate-400" />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
