import { Link } from 'react-router-dom'
import { Construction, ServerOff } from 'lucide-react'
import { FEATURES, type FeatureId } from '../lib/features'
import { useStore } from '../store/StoreContext'
import { HOME_BY_ROLE } from '../lib/navigation'

/**
 * Écran d'un module sans serveur.
 *
 * Il dit trois choses, dans cet ordre : ce que le module fera, qu'il n'est pas
 * disponible, et ce qui lui manque. Le libellé « BACKEND REQUIS » est volontaire
 * — c'est un état, pas une excuse — et il est le même partout pour qu'on le
 * reconnaisse d'un module à l'autre.
 */
export default function FeatureUnavailable({ feature }: { feature: FeatureId }) {
  const f = FEATURES[feature]
  const { currentUser } = useStore()
  const home = currentUser ? HOME_BY_ROLE[currentUser.role] : '/'

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-acier-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-btp-300">
          <ServerOff size={12} />
          Fonctionnalité non disponible
        </span>
        <span className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Backend requis
        </span>
      </div>

      <h1 className="text-2xl font-bold text-acier-900 sm:text-3xl">{f.title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">{f.promise}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-acier-900">
            <Construction size={16} className="text-btp-600" />
            Ce que l’API doit fournir avant l’ouverture
          </div>
          <ul className="mt-3 space-y-2">
            {f.backend.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-btp-500" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Cet écran ne simule rien : il sera remplacé par le module réel une fois ces
            éléments livrés côté serveur.
          </p>
        </div>

        <div className="flex flex-col justify-end gap-2">
          <Link
            to={home}
            className="inline-flex items-center justify-center rounded-lg bg-acier-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-acier-800"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}
