import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import { getRequestByRef } from '../../services/requests'
import RequestTimeline from '../../components/requests/RequestTimeline'
import { PRIORITY_LABELS, REQUEST_STATUS_LABELS, type Request } from '../../types/domain'

/**
 * Suivi d'une demande par sa référence.
 *
 * Le déposant n'a pas de compte : lui imposer une inscription pour savoir où en
 * est son dossier ajouterait un obstacle là où il n'attend qu'une réponse. La
 * référence qu'il a reçue suffit — c'est elle qu'il cite au téléphone, c'est
 * elle qui ouvre le suivi.
 */
export default function RequestTracking() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('ref') ?? ''

  const [query, setQuery] = useState(initial)
  const [request, setRequest] = useState<Request | null>(null)
  const [searched, setSearched] = useState(false)

  // La référence arrive en général par l'adresse, au retour de l'envoi : la
  // recherche part seule plutôt que de faire recopier ce qui est déjà là.
  useEffect(() => {
    if (!initial) return
    let cancelled = false
    void getRequestByRef(initial).then((found) => {
      if (cancelled) return
      setRequest(found ?? null)
      setSearched(true)
    })
    return () => {
      cancelled = true
    }
  }, [initial])

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    setParams(query ? { ref: query } : {})
    const found = await getRequestByRef(query)
    setRequest(found ?? null)
    setSearched(true)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="text-3xl font-black tracking-tight text-acier-900">Suivre ma demande</h1>
      <p className="mt-3 text-slate-600">
        Saisissez la référence qui vous a été communiquée — « VOL-REQ-00491 ».
      </p>

      <form
        onSubmit={search}
        className="mt-6 flex overflow-hidden rounded-xl border border-slate-300 bg-white"
      >
        <div className="flex flex-1 items-center px-4">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="VOL-REQ-00491"
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
      </form>

      {searched && !request && (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <SearchX size={22} />
          </span>
          <p className="mt-3 font-semibold text-acier-900">Aucune demande à cette référence.</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Vérifiez la saisie. Le suivi n’est consultable que depuis le navigateur ayant déposé la
            demande.
          </p>
        </div>
      )}

      {request && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="font-mono text-sm font-bold text-slate-500">
                  {request.reference}
                </span>
                <h2 className="mt-1 text-xl font-bold text-acier-900">{request.subject}</h2>
              </div>
              <span className="rounded-full bg-btp-50 px-3 py-1 text-xs font-bold text-btp-700 ring-1 ring-btp-200">
                {REQUEST_STATUS_LABELS[request.status]}
              </span>
            </div>

            <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Déposée le
                </dt>
                <dd className="mt-1 text-acier-900">
                  {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Localisation
                </dt>
                <dd className="mt-1 text-acier-900">{request.location || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Priorité
                </dt>
                <dd className="mt-1 text-acier-900">{PRIORITY_LABELS[request.priority]}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Avancement
            </h3>
            <div className="mt-5">
              <RequestTimeline status={request.status} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
