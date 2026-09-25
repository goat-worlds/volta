import { Check } from 'lucide-react'
import { PURCHASE_FLOW, PURCHASE_STAGE } from '../../lib/statuses'
import type { PurchaseStage } from '../../store/types'

/**
 * Frise d'une demande d'offre Volta Market.
 *
 * Même dessin que la frise des demandes (RequestTimeline), sur le circuit
 * d'achat du cahier des charges : dix étapes, toutes visibles, la sienne mise
 * en avant. L'acheteur sait ce qui a été fait et ce qui reste — la question
 * « et maintenant ? » trouve sa réponse avant d'être posée.
 */
export default function PurchaseTimeline({
  status,
  compact = false,
}: {
  status: PurchaseStage
  compact?: boolean
}) {
  const current = PURCHASE_FLOW.indexOf(status)
  const reached = (index: number) => (status === 'CLOSED' ? true : index <= current)

  if (compact) {
    return (
      <ol className="flex flex-wrap items-center gap-1.5" aria-label="Avancement de la demande">
        {PURCHASE_FLOW.map((step, index) => (
          <li
            key={step}
            title={PURCHASE_STAGE[step].label}
            aria-current={step === status ? 'step' : undefined}
            className={`h-1.5 w-5 rounded-full ${
              step === status ? 'bg-btp-500' : reached(index) ? 'bg-acier-700' : 'bg-papier-200'
            }`}
          />
        ))}
        <li className="ml-2 text-xs font-semibold text-acier-800">{PURCHASE_STAGE[status].label}</li>
      </ol>
    )
  }

  return (
    <ol aria-label="Avancement de la demande">
      {PURCHASE_FLOW.map((step, index) => {
        const done = reached(index) && step !== status
        const active = step === status
        const last = index === PURCHASE_FLOW.length - 1
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  active
                    ? 'bg-btp-500 text-white ring-4 ring-btp-100'
                    : done
                      ? 'bg-acier-900 text-white'
                      : 'bg-papier-200 text-papier-600'
                }`}
              >
                {done ? <Check size={14} /> : index + 1}
              </span>
              {!last && <span className={`w-px flex-1 ${done ? 'bg-acier-900' : 'bg-papier-200'}`} aria-hidden />}
            </div>
            <span
              className={`pb-5 pt-1 text-sm ${
                active ? 'font-bold text-acier-900' : done ? 'font-medium text-papier-700' : 'text-papier-600'
              }`}
            >
              {PURCHASE_STAGE[step].label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
