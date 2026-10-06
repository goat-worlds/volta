import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Archive, ArrowRight, Calendar, Check, Clock, Package, Receipt, ShoppingCart, Truck, Undo2, X,
} from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import {
  estimateTotal, formatFcfa, quoteRequestsClient, quotesClient,
  type Quote, type QuoteRequest,
} from '../../store/quotesClient'
import { Button, Card, EmptyState, LinkButton, PageTitle, QuoteStatusBadge, CopyRef } from '../../components/ui'
import { useToast } from '../../components/feedback/Toaster'
import SupplierIdentity, { SupplierIdentityCompact } from '../../components/SupplierIdentity'
import { quoteRef, quoteRequestRef } from '../../lib/references'

/**
 * Les statuts d'une demande qui ne bougera plus.
 *
 * Seules celles-là se rangent. Le serveur applique la même règle : l'écran ne
 * décide pas seul de ce qu'on peut mettre de côté.
 */
const TERMINEES = new Set(['ACCEPTED', 'DECLINED', 'REJECTED', 'CLOSED'])

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
  /**
   * Toutes les demandes du client, devis ou non.
   *
   * La page n'assemblait que des devis : une demande envoyée disparaissait de
   * l'espace du client jusqu'à ce qu'un prix arrive, et une demande clôturée
   * n'y revenait jamais. Il voyait son dossier s'évanouir sans comprendre.
   * Une demande appartient à qui l'a déposée : elle reste visible tout son
   * cycle de vie.
   */
  const [demandes, setDemandes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'SENT' | 'ACCEPTED' | 'REJECTED'>('all')
  const [pending, setPending] = useState<string | null>(null)
  /** Afficher aussi ce que le client a rangé. */
  const [voirRangees, setVoirRangees] = useState(false)
  const toast = useToast()

  const load = useCallback(async () => {
    if (!currentUser) return
    try {
      setError(null)

      /*
       * Un appel pour les demandes, un pour les devis.
       *
       * La page en faisait un par demande : vingt dossiers, vingt-et-un
       * appels. Le serveur sait déjà rendre d'un coup les offres qui
       * répondent aux demandes du client connecté — il filtre lui-même, et
       * c'est lui qui garantit qu'on ne voit pas celles d'un autre.
       */
      const [requests, mesDevis] = await Promise.all([
        quoteRequestsClient.listByClient(currentUser.id),
        quotesClient.listAll().catch(() => [] as Quote[]),
      ])

      const parDemande = new Map(requests.map((r) => [r.id, r]))
      const collected: Line[] = []
      mesDevis.forEach((q) => {
        const request = parDemande.get(q.quoteRequestId)
        if (request) collected.push({ quote: q, request })
      })

      // Les offres les plus récentes d'abord : ce sont celles qui appellent une
      // décision.
      collected.sort((a, b) => b.quote.createdAt.localeCompare(a.quote.createdAt))
      setRows(collected)
      setDemandes([...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
    // `loading` ne repasse pas à vrai aux tours suivants : la page clignoterait
    // toutes les quinze secondes en revenant sur « Chargement… ».
  }, [currentUser])

  const { lastSyncAt } = useStore()

  useEffect(() => {
    void load()
  }, [load, lastSyncAt])

  const decide = async (quote: Quote, accept: boolean) => {
    setPending(quote.id)
    try {
      if (accept) {
        await quotesClient.accept(quote.id)
        toast.success('Devis accepté', `${quoteRef(quote.id, quote.createdAt)} — le fournisseur est notifié.`)
      } else {
        await quotesClient.reject(quote.id)
        toast.info('Devis refusé', `${quoteRef(quote.id, quote.createdAt)} a été refusé.`)
      }
      await load()
    } catch (e) {
      toast.fromError(e)
    } finally {
      setPending(null)
    }
  }

  /**
   * Ranger une demande terminée, ou la ressortir.
   *
   * « Supprimer » serait abusif : un devis accepté est un engagement commercial
   * et une demande clôturée garde le motif de sa clôture. L'effacer priverait
   * VOLTA de sa trace et le client de son recours. Sa liste s'allège, le dossier
   * reste.
   */
  const ranger = async (d: QuoteRequest, hidden: boolean) => {
    setPending(d.id)
    try {
      await quoteRequestsClient.setHidden(d.id, hidden)
      setDemandes((c) => c.map((x) => (x.id === d.id ? { ...x, hiddenByClient: hidden } : x)))
      toast.info(
        hidden ? 'Demande rangée' : 'Demande ressortie',
        hidden ? 'Elle reste consultable en affichant les demandes rangées.' : '',
      )
    } catch (e) {
      toast.fromError(e)
    } finally {
      setPending(null)
    }
  }

  const equipmentOf = (id: string) => equipment.find((e) => e.id === id)
  const supplierOf = (id: string) => users.find((u) => u.id === id)

  /** Les demandes auxquelles aucun devis ne répond encore — ou plus jamais. */
  const sansDevis = demandes
    .filter((d) => !rows.some((r) => r.request.id === d.id))
    .filter((d) => voirRangees || !d.hiddenByClient)

  /** Ce qui est rangé : seules les demandes tranchées peuvent l'être. */
  const rangees = demandes.filter((d) => d.hiddenByClient).length

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
        title="Mes demandes de devis"
        subtitle="Toutes vos demandes, de l’envoi à la décision — et les offres chiffrées qui y répondent."
      />

      {/* Les demandes sans prix.
          
          Elles n'apparaissaient nulle part : la page n'assemblait que des devis,
          si bien qu'une demande envoyée disparaissait jusqu'à ce qu'un
          fournisseur réponde, et qu'une demande clôturée ne revenait jamais. Le
          client voyait son dossier s'évanouir sans savoir pourquoi. */}
      {sansDevis.length > 0 && (
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {voirRangees ? 'Mes demandes' : 'En cours de traitement'}
            </h2>
            {rangees > 0 && (
              <button
                type="button"
                onClick={() => setVoirRangees((v) => !v)}
                className="text-xs font-semibold text-btp-600 hover:text-btp-700"
              >
                {voirRangees
                  ? 'Masquer les demandes rangées'
                  : `Afficher les ${rangees} demande${rangees > 1 ? 's' : ''} rangée${rangees > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
          <div className="grid gap-3">
            {sansDevis.map((d) => {
              const eq = equipmentOf(d.equipmentId)
              return (
                <Card key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <img
                      loading="lazy"
                      src={eq?.photos[0] ?? '/images/placeholders/equipment.svg'}
                      alt=""
                      className="h-14 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CopyRef value={quoteRequestRef(d.id, d.createdAt)} />
                        <QuoteStatusBadge status={d.status} />
                      </div>
                      <div className="mt-1 font-semibold text-acier-900">
                        {eq?.name ?? 'Équipement'}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        Demandée le {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                        {d.quantity > 1 ? ` · ${d.quantity} unités` : ''}
                      </div>
                      {d.adminNote && (
                        <p className="mt-1.5 text-xs italic text-slate-600">{d.adminNote}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <LinkButton to={`/client/demandes/${d.id}`} tone="secondary" size="sm">
                      Voir les détails
                    </LinkButton>
                    {/* Ranger n'est offert que sur une demande tranchée : en
                        cours, elle disparaîtrait pendant qu'elle avance et le
                        client ne saurait plus où la retrouver. */}
                    {TERMINEES.has(d.status) && (
                      <Button
                        tone="ghost"
                        size="sm"
                        disabled={pending === d.id}
                        onClick={() => ranger(d, !d.hiddenByClient)}
                        title={d.hiddenByClient ? 'Remettre dans ma liste' : 'Ranger cette demande'}
                      >
                        {d.hiddenByClient ? <Undo2 size={15} /> : <Archive size={15} />}
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

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
              <LinkButton to="/client/demandes/nouvelle">Demander un devis</LinkButton>
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
                    <CopyRef value={quoteRef(quote.id, quote.createdAt)} />
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
                  <img loading="lazy"
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
                          <dt className="text-slate-500">Prix / heure</dt>
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
                        <Button tone="success" onClick={() => decide(quote, true)} disabled={busy}>
                          <Check size={15} />
                          {busy ? 'Envoi…' : 'Accepter'}
                        </Button>
                        <Button tone="secondary" onClick={() => decide(quote, false)} disabled={busy}>
                          <X size={15} />
                          Refuser
                        </Button>
                      </div>
                    ) : (
                      <LinkButton to={`/client/demandes/${request.id}`} tone="secondary">
                        Voir la demande
                        <ArrowRight size={14} />
                      </LinkButton>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
