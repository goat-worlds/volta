import { AlertTriangle, Check, CircleDashed, Loader2, X } from 'lucide-react'
import type { EquipmentStatus, Inspection, Report, User } from '../store/types'

/**
 * Le parcours d'un dossier d'engin, de la constitution à la publication.
 *
 * Le fournisseur voyait jusqu'ici une barre de progression : un pourcentage ne
 * dit ni où en est le dossier, ni qui le détient, ni ce qu'il doit faire. Le
 * parcours nomme chaque étape, la date à laquelle elle a été franchie et la
 * partie qui a la main — c'est ce que demande un fournisseur qui appelle pour
 * savoir « où en est mon engin ».
 */

type StepState = 'done' | 'current' | 'todo' | 'failed'

interface Step {
  key: string
  label: string
  /** Qui agit à cette étape : le fournisseur sait ainsi s'il doit intervenir. */
  owner: string
  detail?: string
  state: StepState
}

/** Rang du dossier dans le parcours nominal, par statut. */
const RANK: Record<EquipmentStatus, number> = {
  DRAFT: 0,
  SUBMITTED: 1,
  PENDING_INSPECTION: 2,
  INSPECTION_IN_PROGRESS: 3,
  REPORT_SUBMITTED: 4,
  PENDING_ADMIN_REVIEW: 4,
  REFERENCED: 5,
  CORRECTIONS_REQUESTED: 5,
  REJECTED: 5,
  PUBLISHED: 6,
  UNPUBLISHED: 6,
}

const STOPPED: EquipmentStatus[] = ['REJECTED', 'CORRECTIONS_REQUESTED']

function frenchDate(value?: string): string | undefined {
  if (!value) return undefined
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function buildSteps({
  status,
  createdAt,
  inspection,
  inspector,
  report,
}: {
  status: EquipmentStatus
  createdAt?: string
  inspection?: Inspection
  inspector?: User
  report?: Report
}): Step[] {
  const rank = RANK[status]
  const stopped = STOPPED.includes(status)

  const stateAt = (index: number): StepState => {
    if (stopped && index === 5) return 'failed'
    if (index < rank) return 'done'
    if (index === rank) return status === 'PUBLISHED' ? 'done' : 'current'
    return 'todo'
  }

  const decisionDetail = () => {
    if (status === 'REJECTED') return 'Dossier refusé après vérification technique.'
    if (status === 'CORRECTIONS_REQUESTED') return 'Corrections demandées : reprenez le dossier puis soumettez-le à nouveau.'
    if (rank >= 5) return 'Engin référencé par VOLTA.'
    return undefined
  }

  return [
    {
      key: 'draft',
      label: 'Dossier constitué',
      owner: 'Vous',
      detail: frenchDate(createdAt),
      state: stateAt(0),
    },
    {
      key: 'submitted',
      label: 'Soumis à VOLTA',
      owner: 'Vous',
      detail: rank >= 1 ? 'Dossier transmis pour vérification.' : "En attente de votre soumission.",
      state: stateAt(1),
    },
    {
      key: 'assigned',
      label: 'Inspection assignée',
      owner: 'VOLTA',
      detail:
        rank >= 2 && inspector
          ? `Confiée à ${inspector.company || inspector.name}${
              inspection?.assignedAt ? ` le ${frenchDate(inspection.assignedAt)}` : ''
            }`
          : rank >= 2
            ? 'Équipe technique désignée.'
            : "VOLTA désigne l'équipe technique.",
      state: stateAt(2),
    },
    {
      key: 'inspection',
      label: 'Inspection sur site',
      owner: 'Équipe technique',
      detail:
        inspection && rank >= 3
          ? `${inspection.checklist.filter((c) => c.result !== null).length} / ${inspection.checklist.length} contrôles renseignés`
          : 'Contrôle technique de l’engin.',
      state: stateAt(3),
    },
    {
      key: 'report',
      label: 'Rapport transmis',
      owner: 'Équipe technique',
      detail: report ? `Transmis le ${frenchDate(report.submittedAt)}` : "Rapport remis à VOLTA.",
      state: stateAt(4),
    },
    {
      key: 'decision',
      label: 'Décision VOLTA',
      owner: 'VOLTA',
      detail: decisionDetail(),
      state: stateAt(5),
    },
    {
      key: 'published',
      label: status === 'UNPUBLISHED' ? 'Retiré du catalogue' : 'Publié au catalogue',
      owner: 'VOLTA',
      detail:
        status === 'PUBLISHED'
          ? 'Visible par les clients, ouvert aux demandes de devis.'
          : status === 'UNPUBLISHED'
            ? 'L’engin n’apparaît plus dans le catalogue public.'
            : 'Mise en ligne après référencement.',
      state: status === 'UNPUBLISHED' ? 'failed' : stateAt(6),
    },
  ]
}

const MARKER: Record<StepState, { className: string; icon: typeof Check }> = {
  done: { className: 'border-emerald-600 bg-emerald-600 text-white', icon: Check },
  current: { className: 'border-btp-500 bg-btp-500 text-white', icon: Loader2 },
  todo: { className: 'border-slate-300 bg-white text-slate-400', icon: CircleDashed },
  failed: { className: 'border-red-600 bg-red-600 text-white', icon: X },
}

export default function WorkflowTimeline({
  status,
  createdAt,
  inspection,
  inspector,
  report,
  className = '',
}: {
  status: EquipmentStatus
  createdAt?: string
  inspection?: Inspection
  inspector?: User
  report?: Report
  className?: string
}) {
  const steps = buildSteps({ status, createdAt, inspection, inspector, report })

  return (
    <ol className={`relative ${className}`}>
      {steps.map((step, index) => {
        const marker = MARKER[step.state]
        const Icon = marker.icon
        const last = index === steps.length - 1
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${
                  step.state === 'done' ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${marker.className}`}
            >
              <Icon size={15} className={step.state === 'current' ? 'animate-spin' : ''} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-sm font-semibold ${
                    step.state === 'todo' ? 'text-slate-400' : 'text-acier-900'
                  }`}
                >
                  {step.label}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  {step.owner}
                </span>
                {step.state === 'current' && (
                  <span className="rounded-full bg-btp-100 px-2 py-0.5 text-[11px] font-semibold text-btp-700">
                    En cours
                  </span>
                )}
              </div>
              {step.detail && (
                <p
                  className={`mt-1 text-xs ${
                    step.state === 'failed' ? 'text-red-600' : 'text-slate-500'
                  }`}
                >
                  {step.detail}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Bandeau d'action, quand la balle est dans le camp du fournisseur. */
export function SupplierNextAction({ status }: { status: EquipmentStatus }) {
  const messages: Partial<Record<EquipmentStatus, string>> = {
    DRAFT: 'Ce dossier n’a pas encore été soumis : VOLTA ne le voit pas.',
    CORRECTIONS_REQUESTED: 'VOLTA attend des corrections de votre part avant de reprendre l’instruction.',
    REJECTED: 'Ce dossier a été refusé. Constituez-en un nouveau si l’engin a été remis en conformité.',
  }
  const message = messages[status]
  if (!message) return null

  return (
    <div className="flex items-start gap-2 rounded-lg border border-btp-200 bg-btp-50 p-3">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-btp-600" />
      <p className="text-xs font-medium text-btp-800">{message}</p>
    </div>
  )
}
