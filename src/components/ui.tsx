import type { ReactNode } from 'react'
import type { EquipmentStatus, Level } from '../store/types'
import { Inbox, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { roleTheme } from '../lib/roleTheme'
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

/**
 * Tuile de chiffre.
 *
 * Elle était entièrement grise — valeur bleue par défaut, icône gris pâle dans
 * une boîte gris pâle — quel que soit l'espace. Alignées par quatre en haut de
 * chaque tableau de bord, ces tuiles occupent le premier regard : les laisser
 * incolores donnait à tout l'espace son aspect délavé.
 *
 * La teinte suit désormais le rôle de l'utilisateur connecté, sans que les
 * pages aient à la passer. Un appelant qui veut marquer une valeur — un compte
 * de retards en rouge, de publiés en vert — garde la main par `accent`.
 */
export function StatCard({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string
  value: ReactNode
  /** Couleur de la valeur, quand elle porte un sens propre. */
  accent?: string
  /** Facultative : les usages existants ne la passent pas. */
  icon?: LucideIcon
}) {
  const { currentUser } = useStore()
  const theme = currentUser ? roleTheme(currentUser.role) : null

  return (
    <Card className="p-4 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`text-2xl font-bold ${accent ?? theme?.text ?? 'text-acier-900'}`}>
            {value}
          </div>
          <div className="mt-1 text-sm text-slate-500">{label}</div>
        </div>
        {Icon && (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              theme?.tileChip ?? 'bg-slate-100 text-slate-400'
            }`}
          >
            <Icon size={18} />
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

/**
 * Bouton.
 *
 * Les actions étaient écrites tantôt en bouton, tantôt en lien souligné, avec
 * une couleur choisie écran par écran — bleu ici, ambre là, indigo ailleurs. Un
 * lien souligné se lit comme une note de bas de page : « Comparer les offres »
 * ou « Voir tout » sont des actions et doivent s'offrir comme telles, avec une
 * cible cliquable de la taille d'un doigt.
 *
 * Le ton par défaut suit le rôle de l'utilisateur, si bien qu'un même appel
 * produit un bouton indigo dans l'administration et bleu chez le client, sans
 * que la page ait à le savoir.
 */
type ButtonTone = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md'

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition ' +
  'disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-offset-2'

const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
}

/** Tons indépendants du rôle : leur sens prime sur la teinte de l'espace. */
const BUTTON_TONE: Partial<Record<ButtonTone, string>> = {
  secondary:
    'border border-slate-300 bg-white text-acier-800 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-400',
  ghost: 'text-acier-700 hover:bg-slate-100 focus-visible:ring-slate-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500',
}

function useButtonClass(tone: ButtonTone, size: ButtonSize, className: string) {
  const { currentUser } = useStore()
  // « primary » emprunte la teinte de l'espace ; les autres portent un sens
  // propre — refuser, valider — que la couleur du rôle brouillerait.
  const primary = currentUser
    ? roleTheme(currentUser.role).button
    : 'bg-btp-500 text-white hover:bg-btp-600 focus-visible:ring-btp-400'
  return `${BUTTON_BASE} ${BUTTON_SIZE[size]} ${BUTTON_TONE[tone] ?? primary} ${className}`
}

export function Button({
  tone = 'primary',
  size = 'md',
  className = '',
  ...props
}: {
  tone?: ButtonTone
  size?: ButtonSize
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={useButtonClass(tone, size, className)} {...props} />
}

/** Même apparence, mais c'est une navigation : le lien reste un lien. */
export function LinkButton({
  to,
  tone = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: {
  to: string
  tone?: ButtonTone
  size?: ButtonSize
  className?: string
  children: ReactNode
} & Omit<React.ComponentProps<typeof Link>, 'to' | 'className'>) {
  return (
    <Link to={to} className={useButtonClass(tone, size, className)} {...props}>
      {children}
    </Link>
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
