import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselProps {
  children: ReactNode
  /** Nommé pour les lecteurs d'écran : « Équipements en vedette », par exemple. */
  ariaLabel: string
  /**
   * Largeur d'une carte selon la taille d'écran. La valeur par défaut montre
   * une carte sur mobile, deux sur tablette, quatre sur grand écran.
   */
  itemClassName?: string
  className?: string
}

/**
 * Carrousel horizontal.
 *
 * Le défilement est celui du navigateur, avec accrochage : la molette, le
 * glissement tactile et la tabulation au clavier fonctionnent sans code, et la
 * liste reste lisible si le JavaScript n'a pas encore pris la main. Les flèches
 * et les points ne font que piloter ce même défilement.
 *
 * Aucune dépendance : une bibliothèque de carrousel pèse plus lourd que les
 * quelques lignes ci-dessous et impose ses propres conventions de style.
 */
export default function Carousel({
  children,
  ariaLabel,
  itemClassName = 'w-[85%] sm:w-[45%] lg:w-[23.5%]',
  className = '',
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const items = Children.toArray(children)
  const [active, setActive] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const { scrollLeft, clientWidth, scrollWidth } = track
    setAtStart(scrollLeft <= 1)
    // Une marge d'un pixel absorbe les arrondis de sous-pixel : sans elle, la
    // flèche « suivant » reste active alors qu'il n'y a plus rien à révéler.
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 1)

    const first = track.firstElementChild as HTMLElement | null
    if (!first) return
    const step = first.offsetWidth + 16
    setActive(Math.min(items.length - 1, Math.round(scrollLeft / step)))
  }, [items.length])

  useEffect(() => {
    sync()
    const track = trackRef.current
    if (!track) return
    // Le redimensionnement change le nombre de cartes visibles, donc la fin de
    // piste : sans cette écoute, la flèche resterait grisée à tort.
    const observer = new ResizeObserver(sync)
    observer.observe(track)
    return () => observer.disconnect()
  }, [sync])

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const first = track.firstElementChild as HTMLElement | null
    const step = first ? first.offsetWidth + 16 : track.clientWidth
    track.scrollBy({ left: step * direction, behavior: 'smooth' })
  }

  const goTo = (index: number) => {
    const track = trackRef.current
    if (!track) return
    const first = track.firstElementChild as HTMLElement | null
    if (!first) return
    track.scrollTo({ left: (first.offsetWidth + 16) * index, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <div className={className}>
      <div
        ref={trackRef}
        onScroll={sync}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className="btp-carousel-track flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-btp-400"
      >
        {items.map((item, index) => (
          <div key={index} className={`shrink-0 snap-start ${itemClassName}`}>
            {item}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex gap-1.5" role="tablist" aria-label={`Position dans ${ariaLabel}`}>
          {items.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === active}
              aria-label={`Élément ${index + 1} sur ${items.length}`}
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === active ? 'w-6 bg-btp-500' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => scrollByPage(-1)}
            disabled={atStart}
            aria-label="Éléments précédents"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-acier-800 transition hover:border-btp-400 hover:text-btp-600 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:text-acier-800"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollByPage(1)}
            disabled={atEnd}
            aria-label="Éléments suivants"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-acier-800 transition hover:border-btp-400 hover:text-btp-600 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:text-acier-800"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
