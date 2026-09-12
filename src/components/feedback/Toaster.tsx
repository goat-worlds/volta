/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AlertTriangle, CheckCircle2, Info, WifiOff, X, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ApiError, ApiUnavailableError, errorMessage } from '../../store/api'

/**
 * Notifications d'action.
 *
 * Chaque écran tenait son propre `useState<string | null>` et son
 * `setTimeout` de quatre secondes, pour afficher une bande verte en bas de
 * page. Une erreur, elle, n'avait pas de forme : selon la page, un texte rouge
 * sous le bouton, un message dans la bande verte, ou rien.
 *
 * Un seul fournisseur, monté au-dessus des routes. Les écrans appellent
 * `toast.success(...)` ou `toast.fromError(err)` et n'ont plus à savoir où ni
 * combien de temps le message s'affiche. La nature — succès, erreur, panne,
 * avertissement — porte sa couleur et son icône ; le texte n'a pas à le redire.
 */

export type ToastTone = 'success' | 'error' | 'warning' | 'info' | 'offline'

export interface ToastInput {
  title: string
  description?: string
  tone?: ToastTone
  /** Durée d'affichage en ms. 0 = jusqu'à fermeture manuelle. */
  duration?: number
}

interface ToastItem extends Required<Omit<ToastInput, 'description'>> {
  id: number
  description?: string
}

interface ToastApi {
  push: (input: ToastInput) => number
  dismiss: (id: number) => void
  success: (title: string, description?: string) => number
  error: (title: string, description?: string) => number
  warning: (title: string, description?: string) => number
  info: (title: string, description?: string) => number
  /**
   * Traduit une erreur en notification : la raison donnée par le serveur, sous
   * un titre qui dit la nature de l'échec. Le titre par défaut convient à une
   * action refusée ; l'appelant peut nommer la sienne.
   */
  fromError: (err: unknown, title?: string) => number
}

const ToastContext = createContext<ToastApi | null>(null)

const DEFAULT_DURATION: Record<ToastTone, number> = {
  success: 5000,
  info: 6000,
  warning: 8000,
  error: 9000,
  // Une panne reste affichée tant qu'elle n'est pas fermée : elle explique
  // pourquoi tout ce qui suit échoue.
  offline: 0,
}

const TONE: Record<ToastTone, { icon: LucideIcon; ring: string; iconClass: string; bar: string }> = {
  success: {
    icon: CheckCircle2,
    ring: 'border-emerald-200',
    iconClass: 'text-emerald-600',
    bar: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    ring: 'border-red-200',
    iconClass: 'text-red-600',
    bar: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    ring: 'border-btp-200',
    iconClass: 'text-btp-600',
    bar: 'bg-btp-500',
  },
  info: {
    icon: Info,
    ring: 'border-acier-200',
    iconClass: 'text-acier-600',
    bar: 'bg-acier-500',
  },
  offline: {
    icon: WifiOff,
    ring: 'border-slate-300',
    iconClass: 'text-slate-600',
    bar: 'bg-slate-500',
  },
}

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((input: ToastInput) => {
    const tone = input.tone ?? 'info'
    const id = nextId++
    const item: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      tone,
      duration: input.duration ?? DEFAULT_DURATION[tone],
    }
    // Cinq notifications au plus : au-delà, les plus anciennes ont déjà été
    // lues ou ne le seront jamais.
    setItems((current) => [...current.slice(-4), item])
    return id
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      push,
      dismiss,
      success: (title, description) => push({ title, description, tone: 'success' }),
      error: (title, description) => push({ title, description, tone: 'error' }),
      warning: (title, description) => push({ title, description, tone: 'warning' }),
      info: (title, description) => push({ title, description, tone: 'info' }),
      fromError: (err, title) => {
        if (err instanceof ApiUnavailableError) {
          return push({
            tone: 'offline',
            title: 'Service temporairement indisponible',
            description:
              'VOLTA n’arrive pas à joindre le serveur. Vos données locales n’ont pas été perdues.',
          })
        }
        if (err instanceof ApiError) {
          const heading =
            title ??
            (err.status === 403
              ? 'Action impossible'
              : err.status === 401
                ? 'Session expirée'
                : err.status === 409
                  ? 'Action non permise dans cet état'
                  : err.status >= 500
                    ? 'Une erreur est survenue'
                    : 'Action impossible')
          return push({ tone: 'error', title: heading, description: err.message })
        }
        return push({ tone: 'error', title: title ?? 'Action impossible', description: errorMessage(err) })
      },
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ToastViewport({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    // En haut à droite, hors du flux : les actions se font au centre de
    // l'écran, la confirmation n'a pas à les recouvrir. `aria-live` fait lire
    // chaque arrivée par les lecteurs d'écran sans déplacer le focus.
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex flex-col items-end gap-2 px-4 sm:inset-x-auto sm:right-4 sm:w-96"
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={() => onDismiss(item.id)} />
      ))}
    </div>
  )
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const tone = TONE[item.tone]
  const timer = useRef<number | null>(null)
  const [paused, setPaused] = useState(false)

  // Le compte à rebours s'arrête sous la souris : on lit à son rythme.
  useEffect(() => {
    if (item.duration === 0 || paused) return
    timer.current = window.setTimeout(onDismiss, item.duration)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [item.duration, paused, onDismiss])

  return (
    <div
      role={item.tone === 'error' || item.tone === 'offline' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-xl border bg-white shadow-lg shadow-acier-900/10 ${tone.ring} animate-[volta-toast-in_180ms_ease-out]`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${tone.bar}`} aria-hidden />
      <div className="flex items-start gap-3 py-3 pl-4 pr-3">
        <tone.icon size={18} className={`mt-0.5 shrink-0 ${tone.iconClass}`} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-acier-900">{item.title}</div>
          {item.description && (
            <div className="mt-0.5 text-sm leading-snug text-slate-600">{item.description}</div>
          )}
        </div>
        <button
          onClick={onDismiss}
          aria-label="Fermer la notification"
          className="-mr-1 -mt-1 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
