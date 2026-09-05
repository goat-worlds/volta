import type { ReactNode } from 'react'
import type { EquipmentStatus, Level } from '../store/types'
import { Inbox, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const STATUS_LABELS: Record<EquipmentStatus, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumis',
  PENDING_INSPECTION: 'À vérifier',
  INSPECTION_IN_PROGRESS: 'Vérification en cours',
  REPORT_SUBMITTED: 'Rapport transmis',
  PENDING_ADMIN_REVIEW: 'En attente de décision',
  REJECTED: 'Refusé',
  CORRECTIONS_REQUESTED: 'Corrections demandées',
  REFERENCED: 'Référencé',
  PUBLISHED: 'Publié',
  UNPUBLISHED: 'Dépublié',
}

const STATUS_COLORS: Record<EquipmentStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  PENDING_INSPECTION: 'bg-amber-100 text-amber-700',
  INSPECTION_IN_PROGRESS: 'bg-orange-100 text-orange-700',
  REPORT_SUBMITTED: 'bg-indigo-100 text-indigo-700',
  PENDING_ADMIN_REVIEW: 'bg-purple-100 text-purple-700',
  REJECTED: 'bg-red-100 text-red-700',
  CORRECTIONS_REQUESTED: 'bg-yellow-100 text-yellow-800',
  REFERENCED: 'bg-cyan-100 text-cyan-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  UNPUBLISHED: 'bg-slate-200 text-slate-600',
}

export function StatusBadge({ status }: { status: EquipmentStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

const LEVEL_COLORS: Record<Level, string> = {
  BASIC: 'bg-slate-200 text-slate-700',
  SILVER: 'bg-gray-300 text-gray-800',
  GOLD: 'bg-yellow-200 text-yellow-800',
}

export function LevelBadge({ level }: { level: Level | null }) {
  if (!level) return null
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${LEVEL_COLORS[level]}`}>
      {level === 'BASIC' ? 'Basic' : level === 'SILVER' ? 'Silver' : 'Gold'}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
}

export function StatCard({
  label,
  value,
  accent = 'text-blue-700',
  icon: Icon,
}: {
  label: string
  value: ReactNode
  accent?: string
  /** Facultative : les usages existants ne la passent pas. */
  icon?: LucideIcon
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`text-2xl font-bold ${accent}`}>{value}</div>
          <div className="mt-1 text-sm text-slate-500">{label}</div>
        </div>
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
            <Icon size={18} className="text-slate-400" />
          </span>
        )}
      </div>
    </Card>
  )
}

export function EmptyState({
  title,
  subtitle,
  icon: Icon = Inbox,
  action,
}: {
  title: string
  subtitle?: string
  icon?: LucideIcon
  /** Un état vide qui propose l'action qui le remplira vaut mieux qu'un constat. */
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon size={22} className="text-slate-400" />
      </span>
      <div className="mt-3 font-semibold text-slate-700">{title}</div>
      {subtitle && <div className="mt-1 max-w-sm text-sm text-slate-500">{subtitle}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${value}%` }} />
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
      {message}
    </div>
  )
}

export const fmtPrice = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`

/**
 * Badge des statuts du workflow de devis.
 *
 * Distinct de StatusBadge, qui porte les statuts d'équipement : les deux
 * ensembles ne se recouvrent pas, et les confondre ferait afficher un libellé
 * d'équipement sur un devis.
 */
export function QuoteStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { label: string; className: string }> = {
    // Demande de devis
    PENDING: { label: 'En attente', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
    DECLINED: { label: 'Refusée', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
    // Devis
    SENT: { label: 'Reçu', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
    ACCEPTED: { label: 'Accepté', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
    REJECTED: { label: 'Refusé', className: 'bg-red-50 text-red-700 ring-red-200' },
  }

  // Un statut inconnu s'affiche tel quel plutôt que de disparaître : mieux vaut
  // une étiquette brute qu'une case vide devant l'utilisateur.
  const style = styles[status] ?? { label: status, className: 'bg-slate-100 text-slate-600 ring-slate-200' }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.className}`}>
      {style.label}
    </span>
  )
}
