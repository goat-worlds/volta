import { Check } from 'lucide-react'
import { REQUEST_FLOW, requestStatusLabel, type RequestStatus } from '../../types/domain'

/**
 * Frise de suivi d'une demande.
 *
 * Une demande déposée disparaît, du point de vue du client, dans un délai qu'il
 * ne maîtrise pas : il ne sait ni si elle a été lue, ni ce qui reste à faire.
 * La frise montre les dix étapes du traitement et où en est la sienne — ce qui
 * répond d'avance à l'appel « alors, ça avance ? ».
 *
 * Les étapes à venir restent visibles en gris : les masquer donnerait
 * l'impression d'un parcours plus court qu'il n'est, et chaque étape franchie
 * ressemblerait à un retard.
 */
export default function RequestTimeline({
  status,
  compact = false,
  intent,
}: {
  status: RequestStatus
  /** Version en ligne pour les tableaux ; sinon, liste verticale détaillée. */
  compact?: boolean
  /** Une candidature porte les mots du recrutement, pas ceux du devis. */
  intent?: string | null
}) {
  const current = REQUEST_FLOW.indexOf(status)
  // Une demande clôturée l'est quel qu'ait été son chemin : toutes les étapes
  // se lisent alors comme derrière soi.
  const reached = (index: number) => (status === 'CLOSED' ? true : index <= current)

  if (compact) {
    return (
      <ol className="flex flex-wrap items-center gap-1.5" aria-label="Avancement de la demande">
        {REQUEST_FLOW.map((step, index) => (
          <li
            key={step}
            title={requestStatusLabel(step, intent)}
            aria-current={step === status ? 'step' : undefined}
            className={`h-1.5 w-6 rounded-full ${
              step === status ? 'bg-btp-500' : reached(index) ? 'bg-acier-700' : 'bg-slate-200'
            }`}
          />
        ))}
        <li className="ml-2 text-xs font-semibold text-acier-800">
          {requestStatusLabel(status, intent)}
        </li>
      </ol>
    )
  }

  return (
    <ol className="space-y-0" aria-label="Avancement de la demande">
      {REQUEST_FLOW.map((step, index) => {
        const done = reached(index) && step !== status
        const active = step === status
        const last = index === REQUEST_FLOW.length - 1

        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  active
                    ? 'bg-btp-500 text-white ring-4 ring-btp-100'
                    : done
                      ? 'bg-acier-900 text-white'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? <Check size={14} /> : index + 1}
              </span>
              {!last && (
                <span
                  className={`w-px flex-1 ${done ? 'bg-acier-900' : 'bg-slate-200'}`}
                  aria-hidden
                />
              )}
            </div>

            <span
              className={`pb-5 pt-1 text-sm ${
                active
                  ? 'font-bold text-acier-900'
                  : done
                    ? 'font-medium text-slate-700'
                    : 'text-slate-400'
              }`}
            >
              {requestStatusLabel(step, intent)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
