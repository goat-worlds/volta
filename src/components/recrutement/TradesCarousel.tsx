import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react'

/**
 * Les métiers, sur une seule ligne qui avance d'un cran.
 *
 * <h2>Pourquoi une ligne et non une grille</h2>
 *
 * Six cartes en grille se lisent comme un formulaire : on les parcourt du
 * regard, on n'en retient aucune. Une ligne qui avance attire l'œil sur celle
 * qui entre, et c'est elle qu'on lit. Le recrutement n'a pas besoin qu'on
 * compare six métiers, il a besoin qu'on en reconnaisse un.
 *
 * <h2>Un cran, pas une page</h2>
 *
 * Cinq cartes sont visibles et l'avance porte sur une seule : le reste de la
 * ligne ne bouge pas sous les yeux, seule la nouvelle arrive. Faire glisser
 * cinq cartes à la fois ferait disparaître d'un coup ce qu'on était en train
 * de lire.
 *
 * <h2>Ce qui l'arrête</h2>
 *
 * Le survol, le doigt sur la ligne, le focus clavier, et l'onglet laissé en
 * arrière-plan. Un carrousel qui continue pendant qu'on lit une carte est un
 * carrousel qu'on referme.
 *
 * `prefers-reduced-motion` coupe l'avance automatique : le mouvement
 * périphérique est précisément ce que cette préférence demande d'éviter. Les
 * flèches restent, pour que le contenu reste atteignable.
 *
 * <h2>Pas de duplication</h2>
 *
 * La boucle revient au début plutôt que de cloner les cartes. Six éléments
 * dupliqués, ce sont six liens de plus pour un lecteur d'écran, qui entend
 * alors la liste deux fois.
 */

export interface Metier {
  icon: LucideIcon
  title: string
  text: string
}

/** Toutes les trois secondes : le temps de lire un intitulé et sa ligne. */
const INTERVALLE = 3000

export default function TradesCarousel({ metiers }: { metiers: Metier[] }) {
  const piste = useRef<HTMLUListElement | null>(null)
  const [actif, setActif] = useState(0)
  const [suspendu, setSuspendu] = useState(false)

  const allerA = useCallback(
    (index: number) => {
      const liste = piste.current
      if (!liste) return
      const total = metiers.length
      const cible = ((index % total) + total) % total
      const carte = liste.children[cible] as HTMLElement | undefined
      if (!carte) return
      // `scrollTo` sur le conteneur plutôt que `scrollIntoView` : celui-ci fait
      // aussi défiler la page pour amener la carte à l'écran, ce qui arrache le
      // lecteur à ce qu'il regardait.
      liste.scrollTo({ left: carte.offsetLeft - liste.offsetLeft, behavior: 'smooth' })
      setActif(cible)
    },
    [metiers.length],
  )

  useEffect(() => {
    if (suspendu) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const minuteur = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      setActif((n) => {
        const suivant = (n + 1) % metiers.length
        const liste = piste.current
        const carte = liste?.children[suivant] as HTMLElement | undefined
        if (liste && carte) {
          liste.scrollTo({ left: carte.offsetLeft - liste.offsetLeft, behavior: 'smooth' })
        }
        return suivant
      })
    }, INTERVALLE)

    return () => window.clearInterval(minuteur)
  }, [suspendu, metiers.length])

  return (
    <div
      className="relative"
      onMouseEnter={() => setSuspendu(true)}
      onMouseLeave={() => setSuspendu(false)}
      onFocusCapture={() => setSuspendu(true)}
      onBlurCapture={() => setSuspendu(false)}
      onTouchStart={() => setSuspendu(true)}
    >
      <ul
        ref={piste}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Les métiers recherchés"
      >
        {metiers.map((m, i) => {
          const Icon = m.icon
          return (
            <li
              key={m.title}
              aria-current={i === actif ? 'true' : undefined}
              /* Cinq visibles au-delà de `lg`, deux sur tablette, un peu plus
                 d'une sur téléphone — la carte suivante dépasse volontairement,
                 c'est ce qui dit qu'il y en a d'autres. */
              className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-4rem)/5)]"
            >
              <div
                className={`flex h-full flex-col rounded-xl border bg-white p-5 transition ${
                  i === actif
                    ? 'border-btp-300 shadow-md'
                    : 'border-papier-200 shadow-xs'
                }`}
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-btp-50 text-btp-600">
                  <Icon size={19} aria-hidden />
                </span>
                <h3 className="mt-3 text-sm font-bold leading-snug text-acier-900">{m.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-papier-600">{m.text}</p>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => allerA(actif - 1)}
          aria-label="Métier précédent"
          className="grid size-9 place-items-center rounded-full border border-papier-200 bg-white text-acier-800 transition hover:border-btp-400 hover:text-btp-600"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>

        {/* Les pastilles disent combien il y en a, et où l'on en est : une
            ligne qui avance seule laisse sinon croire qu'on a tout vu. */}
        <ul className="flex items-center gap-1.5">
          {metiers.map((m, i) => (
            <li key={m.title}>
              <button
                type="button"
                onClick={() => allerA(i)}
                aria-label={m.title}
                aria-current={i === actif ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  i === actif ? 'w-6 bg-btp-500' : 'w-1.5 bg-papier-300 hover:bg-papier-400'
                }`}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => allerA(actif + 1)}
          aria-label="Métier suivant"
          className="grid size-9 place-items-center rounded-full border border-papier-200 bg-white text-acier-800 transition hover:border-btp-400 hover:text-btp-600"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </div>
  )
}
