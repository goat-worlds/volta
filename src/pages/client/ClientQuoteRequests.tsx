import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Plus, ArrowRight } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { quoteRequestsClient, quotesClient, type QuoteRequest } from '../../store/quotesClient'
import { Card, CopyRef, EmptyState, PageTitle, QuoteStatusBadge, displayQuoteRequestStatus, fmtPrice } from '../../components/ui'
import { useToast } from '../../components/feedback/Toaster'
import { quoteRequestRef } from '../../lib/references'
import { listMyRequests, respondToRequest, type MyRequestView } from '../../services/requests'
import { requestStatusLabel, type IntentId } from '../../types/domain'
import { intentById } from '../../lib/intents'
import { LinkButton } from '../../components/ui'

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
  /**
   * Les demandes déposées par les parcours.
   *
   * Deux chemins mènent ici : la demande de devis portée sur un engin précis
   * du catalogue, et la demande libre d'un parcours — louer sans engin choisi,
   * composer une flotte, bâtir, chercher un technicien, acheter des pièces.
   * La seconde ne vivait que dans la console d'administration : le client
   * recevait sa référence, puis ne retrouvait plus rien sur la page qui
   * s'appelle pourtant « Mes demandes de devis ». Il lui restait le suivi
   * public, à condition d'avoir gardé le code de son accusé.
   *
   * Elles sont listées à part du tableau plutôt que fondues dedans : elles ne
   * portent ni engin du catalogue ni décompte d'offres, et les sept colonnes
   * seraient à moitié vides.
   */
  const [parcours, setParcours] = useState<MyRequestView[]>([])
  const [repondant, setRepondant] = useState<string | null>(null)
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'AWAITING_VALIDATION' | 'PENDING' | 'ACCEPTED' | 'DECLINED'>('all')

  useEffect(() => {
    if (!currentUser) return
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        // Les demandes de parcours ne font pas échouer la page : si cette
        // liste manque, le tableau reste lisible.
        void listMyRequests()
          .then((d) => { if (!cancelled) setParcours(d) })
          .catch(() => { if (!cancelled) setParcours([]) })

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

  /**
   * Accepter ou refuser la proposition.
   *
   * Le refus demande son motif puis s'arrête si le client ferme la boîte : un
   * clic malheureux sur « Refuser » clôturait sinon un dossier que rien ne
   * rouvre. Refusée, la demande reste affichée, clôturée, avec le prix qu'on
   * lui avait proposé — elle n'est pas retirée de l'espace.
   */
  const repondre = async (d: MyRequestView, accepted: boolean) => {
    let motif = ''
    if (!accepted) {
      const saisi = window.prompt(
        `Refuser la proposition pour ${d.reference} ?

Indiquez brièvement pourquoi (facultatif).`,
      )
      if (saisi === null) return
      motif = saisi.trim()
    }
    setRepondant(d.id)
    try {
      const maj = await respondToRequest(d.id, accepted, motif)
      setParcours((liste) => liste.map((x) => (x.id === maj.id ? maj : x)))
      if (accepted) {
        toast.success('Proposition acceptée', `${d.reference} — VOLTA prépare la suite.`)
      } else {
        toast.info('Proposition refusée', `${d.reference} a été clôturée.`)
      }
    } catch (e) {
      toast.fromError(e)
    } finally {
      setRepondant(null)
    }
  }

  const equipmentName = (id: string) => equipment.find((e) => e.id === id)?.name ?? 'Équipement'

  const visible = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  const tabs: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'AWAITING_VALIDATION', label: 'Chez VOLTA' },
    { key: 'PENDING', label: 'Transmises' },
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

      {/* Les demandes parties d'un parcours.
          
          Avant le tableau, et hors des onglets : ceux-ci filtrent sur les
          statuts de la table des devis, que ces demandes-là n'ont pas. Les y
          soumettre les aurait fait disparaître au premier filtre. */}
      {parcours.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Mes demandes déposées
          </h2>
          <div className="grid gap-3">
            {parcours.map((d) => {
              const origine = intentById(d.intent as IntentId)
              return (
                <Card
                  key={d.reference}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CopyRef value={d.reference} />
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {requestStatusLabel(d.status, d.intent)}
                      </span>
                    </div>
                    <div className="mt-1 font-semibold text-acier-900">{d.subject}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {origine ? `${origine.title} · ` : ''}
                      Déposée le {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                      {d.location ? ` · ${d.location}` : ''}
                    </div>
                    {d.offerAmount != null && (
                      <div className="mt-1 text-sm font-semibold text-btp-700">
                        {fmtPrice(d.offerAmount)}
                        {d.status === 'QUOTE_SENT' && (
                          <span className="ml-2 text-xs font-medium text-slate-500">
                            proposé par VOLTA
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Les deux boutons n'existent qu'au moment où le dossier
                        attend le client : avant, il n'y a rien à accepter ;
                        après, la prestation court. */}
                    {d.status === 'QUOTE_SENT' && d.offerAmount != null && (
                      <>
                        <button
                          type="button"
                          disabled={repondant === d.id}
                          onClick={() => void repondre(d, true)}
                          className="rounded-lg bg-btp-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-btp-600 disabled:opacity-50"
                        >
                          Accepter
                        </button>
                        <button
                          type="button"
                          disabled={repondant === d.id}
                          onClick={() => void repondre(d, false)}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-acier-900 transition hover:border-red-300 hover:text-red-700 disabled:opacity-50"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                    <LinkButton
                      to={`/suivi?ref=${encodeURIComponent(d.reference)}&token=${encodeURIComponent(d.trackingToken)}`}
                      tone="secondary"
                      size="sm"
                    >
                      Suivre
                    </LinkButton>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

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
                  <th className="px-5 py-3 font-medium">Référence</th>
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
                    <td className="px-5 py-3"><CopyRef value={quoteRequestRef(r.id)} /></td>
                    <td className="px-5 py-3 font-medium text-slate-900">{equipmentName(r.equipmentId)}</td>
                    <td className="px-5 py-3 text-slate-600">{r.startDate} → {r.endDate}</td>
                    <td className="px-5 py-3 text-slate-600">{r.quantity}</td>
                    <td className="px-5 py-3 text-slate-600">{quoteCounts[r.id] ?? 0}</td>
                    <td className="px-5 py-3"><QuoteStatusBadge status={displayQuoteRequestStatus(r.status, quoteCounts[r.id] ?? 0)} /></td>
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
                    <QuoteStatusBadge status={displayQuoteRequestStatus(r.status, quoteCounts[r.id] ?? 0)} />
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
