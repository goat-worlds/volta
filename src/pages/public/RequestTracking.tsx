import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import { trackRequest, type RequestTrackingInfo } from '../../services/requests'
import { trackPurchase } from '../../services/market'
import RequestTimeline from '../../components/requests/RequestTimeline'
import PurchaseTimeline from '../../components/market/PurchaseTimeline'
import { PURCHASE_STAGE } from '../../lib/statuses'
import { fmtPrice, CopyRef } from '../../components/ui'
import type { PurchaseTracking } from '../../store/types'
import { PRIORITY_LABELS, REQUEST_STATUS_LABELS } from '../../types/domain'

/**
 * Suivi d'une demande par sa référence.
 *
 * Le déposant n'a pas de compte : lui imposer une inscription pour savoir où en
 * est son dossier ajouterait un obstacle là où il n'attend qu'une réponse. La
 * référence et le code de suivi qu'il a reçus suffisent.
 *
 * Deux familles, deux services : les demandes des parcours (VOL-REQ, référence
 * + code de suivi) et les demandes d'offre Volta Market (VOL-ACH, référence
 * seule). Le préfixe décide où chercher.
 */
const isPurchaseRef = (ref: string) => ref.trim().toUpperCase().startsWith('VOL-ACH-')

export default function RequestTracking() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('ref') ?? ''
  const initialToken = params.get('token') ?? ''

  const [query, setQuery] = useState(initial)
  const [tokenInput, setTokenInput] = useState(initialToken)
  const [request, setRequest] = useState<RequestTrackingInfo | null>(null)
  const [purchase, setPurchase] = useState<PurchaseTracking | null>(null)
  const [searched, setSearched] = useState(false)

  const lookup = async (ref: string, token: string) => {
    if (isPurchaseRef(ref)) {
      setRequest(null)
      try {
        setPurchase(await trackPurchase(ref))
      } catch {
        setPurchase(null)
      }
    } else {
      setPurchase(null)
      try {
        setRequest(await trackRequest(ref, token))
      } catch {
        setRequest(null)
      }
    }
    setSearched(true)
  }

  // La référence arrive en général par l'adresse, au retour de l'envoi : la
  // recherche part seule plutôt que de faire recopier ce qui est déjà là.
  useEffect(() => {
    if (!initial) return
    void lookup(initial, initialToken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial])

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (query) next.ref = query
    if (tokenInput) next.token = tokenInput
    setParams(next)
    await lookup(query, tokenInput)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="volta-display text-4xl text-acier-900">Suivre ma demande</h1>
      <p className="mt-3 text-papier-700">
        Saisissez la référence qui vous a été communiquée — « VOL-REQ-2026-000491 » pour une
        demande (avec son code de suivi), « VOL-ACH-2026-000012 » pour une commande Volta Market.
      </p>

      <form onSubmit={search} className="mt-6 space-y-2">
        <div className="flex overflow-hidden rounded-xl border border-papier-200 bg-white">
          <div className="flex flex-1 items-center px-4">
            <Search className="h-5 w-5 shrink-0 text-papier-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="VOL-REQ-2026-000491"
              aria-label="Référence de la demande"
              className="ml-2 w-full py-3 font-mono text-sm uppercase text-acier-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-acier-900 px-6 text-sm font-bold text-white transition hover:bg-acier-800"
          >
            Rechercher
          </button>
        </div>
        {!isPurchaseRef(query) && (
          <input
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Code de suivi (uniquement pour une demande VOL-REQ)"
            aria-label="Code de suivi"
            className="w-full rounded-lg border border-papier-200 bg-white px-4 py-2.5 font-mono text-sm uppercase text-acier-900 focus:border-btp-500 focus:outline-none"
          />
        )}
      </form>

      {searched && !request && !purchase && (
        <div className="mt-8 flex flex-col items-center rounded-lg border border-dashed border-papier-200 bg-white p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-papier-100 text-papier-600">
            <SearchX size={22} />
          </span>
          <p className="mt-3 font-semibold text-acier-900">Aucune demande à cette référence.</p>
          <p className="mt-1 max-w-sm text-sm text-papier-600">
            Vérifiez la référence. Une demande de parcours (VOL-REQ) exige aussi son code de suivi,
            remis une seule fois au dépôt.
          </p>
        </div>
      )}

      {purchase && (
        <div className="mt-8 space-y-6">
          <div className="rounded-lg border border-papier-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CopyRef value={purchase.reference} />
                <h2 className="mt-1 text-xl font-bold text-acier-900">
                  Commande — {purchase.listingTitle || 'annonce Volta Market'}
                </h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${PURCHASE_STAGE[purchase.status]?.className ?? 'bg-papier-100'}`}>
                {PURCHASE_STAGE[purchase.status]?.label ?? purchase.status}
              </span>
            </div>
            <dl className="mt-5 grid gap-4 border-t border-papier-100 pt-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-papier-600">Déposée le</dt>
                <dd className="mt-1 text-acier-900">{new Date(purchase.createdAt).toLocaleDateString('fr-FR')}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-papier-600">Quantité</dt>
                <dd className="mt-1 text-acier-900">{purchase.quantity}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-papier-600">Montant</dt>
                <dd className="mt-1 font-semibold text-acier-900">
                  {purchase.offerAmount != null ? fmtPrice(purchase.offerAmount) : 'En préparation'}
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-papier-200 bg-white p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-papier-600">Avancement</h3>
            <div className="mt-5">
              <PurchaseTimeline status={purchase.status} />
            </div>
          </div>
        </div>
      )}

      {request && (
        <div className="mt-8 space-y-6">
          <div className="rounded-lg border border-papier-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CopyRef value={request.reference} />
                <h2 className="mt-1 text-xl font-bold text-acier-900">{request.subject}</h2>
              </div>
              <span className="rounded-full bg-btp-50 px-3 py-1 text-xs font-bold text-btp-700 ring-1 ring-btp-200">
                {REQUEST_STATUS_LABELS[request.status]}
              </span>
            </div>

            <dl className="mt-5 grid gap-4 border-t border-papier-100 pt-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-papier-600">
                  Déposée le
                </dt>
                <dd className="mt-1 text-acier-900">
                  {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-papier-600">
                  Localisation
                </dt>
                <dd className="mt-1 text-acier-900">{request.location || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-papier-600">
                  Priorité
                </dt>
                <dd className="mt-1 text-acier-900">{PRIORITY_LABELS[request.priority]}</dd>
              </div>
            </dl>
          </div>

          {/* La rencontre fixée par VOLTA, en tête : c'est ce que la personne
              vient chercher, plus encore que l'avancement. */}
          {request.meetingAt && (
            <div className="rounded-lg border-2 border-btp-500 bg-btp-50/50 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-btp-700">
                VOLTA vous donne rendez-vous
              </h3>
              <p className="volta-display mt-2 text-2xl text-acier-900">{request.meetingAt}</p>
              {request.meetingNote && (
                <p className="mt-2 text-sm text-papier-700">{request.meetingNote}</p>
              )}
              <p className="mt-3 text-xs text-papier-600">
                Présentez-vous avec votre référence {request.reference}.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-papier-200 bg-white p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-papier-600">
              Avancement
            </h3>
            <div className="mt-5">
              <RequestTimeline status={request.status} intent={request.intent} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
