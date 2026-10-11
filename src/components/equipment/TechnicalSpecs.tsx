import { Box, Gauge, Maximize2, Shovel, Weight } from 'lucide-react'
import type { Equipment } from '../../store/types'

/**
 * Les caractéristiques de plaque d'un engin.
 *
 * <h2>Pourquoi ce bloc existe</h2>
 *
 * La fiche disait l'année, le compteur, la ville et l'état déclaré. De quoi
 * identifier la machine, pas de quoi la choisir : celui qui doit déplacer
 * 3000 m³ d'argile compare des puissances et des godets, pas des millésimes.
 * Sans ces chiffres, il appelait pour les demander — ou il allait les chercher
 * ailleurs.
 *
 * <h2>Ce qui est affiché, et rien d'autre</h2>
 *
 * Chaque ligne absente disparaît. Un tableau qui annoncerait « Puissance : — »
 * sur la moitié de ses lignes ferait passer un parc renseigné pour un parc
 * négligé, et il apprendrait au lecteur à ne plus lire le tableau. Le bloc
 * entier s'efface si rien n'est renseigné.
 *
 * <h2>Des chaînes, pas des nombres</h2>
 *
 * Une puissance se lit « 148 kW (198 ch) », un godet « 1,2 m³ ». Elles sont
 * stockées et rendues telles que le fournisseur les recopie de sa
 * documentation : on n'en fait aucun calcul, on les montre.
 */

const LIGNES: { cle: keyof Equipment; label: string; icon: typeof Gauge }[] = [
  { cle: 'power', label: 'Puissance', icon: Gauge },
  { cle: 'operatingWeight', label: 'Poids opérationnel', icon: Weight },
  { cle: 'bucketCapacity', label: 'Capacité du godet', icon: Shovel },
  { cle: 'dimensions', label: 'Dimensions', icon: Maximize2 },
]

export function hasSpecs(eq: Equipment): boolean {
  return LIGNES.some((l) => typeof eq[l.cle] === 'string' && (eq[l.cle] as string).trim())
    || Boolean(eq.otherSpecs?.trim())
}

export default function TechnicalSpecs({ eq }: { eq: Equipment }) {
  const lignes = LIGNES.filter(
    (l) => typeof eq[l.cle] === 'string' && (eq[l.cle] as string).trim(),
  )
  if (lignes.length === 0 && !eq.otherSpecs?.trim()) return null

  return (
    <section className="rounded-xl border border-papier-200 bg-white p-5 sm:p-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
        Caractéristiques techniques
      </h2>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {lignes.map(({ cle, label, icon: Icon }) => (
          <div
            key={cle}
            className="flex items-start gap-3 rounded-lg bg-papier-50 px-3.5 py-3"
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-btp-600 ring-1 ring-papier-200">
              <Icon size={15} aria-hidden />
            </span>
            <span className="min-w-0">
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="mt-0.5 font-semibold leading-snug text-acier-900">
                {eq[cle] as string}
              </dd>
            </span>
          </div>
        ))}
      </dl>

      {eq.otherSpecs?.trim() && (
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-papier-50 px-3.5 py-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-btp-600 ring-1 ring-papier-200">
            <Box size={15} aria-hidden />
          </span>
          <span className="min-w-0">
            <div className="text-xs text-slate-500">Équipements et options</div>
            {/* `whitespace-pre-line` : le fournisseur sépare ses options par des
                retours à la ligne, et tout coller en un paragraphe rendrait une
                liste illisible. */}
            <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-acier-800">
              {eq.otherSpecs}
            </p>
          </span>
        </div>
      )}
    </section>
  )
}
