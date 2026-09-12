import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

/**
 * Cadre commun des écrans d'erreur.
 *
 * Un code, un titre, une phrase qui dit quoi faire, et les actions qui
 * permettent d'en sortir. Le code est affiché en grand parce qu'il est ce que
 * l'utilisateur relaiera au support ; le reste est écrit pour lui.
 */
export default function ErrorScreen({
  code,
  title,
  description,
  icon: Icon,
  actions,
  detail,
}: {
  /** « 404 », « 403 »… ou un mot-clé quand il n'y a pas de statut HTTP. */
  code: string
  title: string
  description: string
  icon: LucideIcon
  actions?: ReactNode
  /** Identifiant technique ou précision, en petit sous le texte. */
  detail?: ReactNode
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-acier-900 text-btp-400 shadow-lg shadow-acier-900/20">
          <Icon size={30} />
        </div>
        <div className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{code}</div>
        <h1 className="mt-2 text-2xl font-bold text-acier-900 sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">{description}</p>
        {detail && <div className="mt-4 text-xs text-slate-500">{detail}</div>}
        {actions && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
