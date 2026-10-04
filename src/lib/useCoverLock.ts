import { useEffect, useRef, useState } from 'react'

/**
 * Verrou de la couverture : la page reste sur le premier écran jusqu'au clic
 * sur « Découvrir ».
 *
 * <h2>Pourquoi cette mécanique et pas une autre</h2>
 *
 * Elle est reprise de CYBERAS, où elle a été mise au point contre trois pièges
 * que rien ne laisse deviner. Chacun se paie par un bouton qui ne fait rien,
 * d'où la reprise à l'identique plutôt qu'une réécriture.
 *
 * <strong>Un</strong> : le verrou se pose sur `<html>`, pas seulement sur
 * `<body>`. Sur iOS, seul l'élément racine arrête le défilement par inertie ;
 * posé sur le corps, la page continue de glisser. Les deux sont posés, parce que
 * selon le navigateur et la feuille de style, le défilement appartient tantôt à
 * l'un tantôt à l'autre — et `overflow: hidden` sur la racine ne change alors
 * rien.
 *
 * <strong>Deux</strong> : il ne se pose qu'en haut de page. Un rechargement à
 * mi-parcours, ou un retour arrière, ne doit pas ramener de force le visiteur à
 * une couverture qu'il avait déjà passée.
 *
 * <strong>Trois</strong> : libérer puis défiler dans la foulée ne produit rien.
 * Rendre `overflow` à sa valeur d'origine ne rend pas le document défilable à
 * l'instant même : le navigateur attend le recalcul de mise en page suivant.
 * D'où les deux passages par `requestAnimationFrame`, et la position calculée à
 * la main plutôt que par `scrollIntoView`, qui retombe parfois sur zéro juste
 * après un déverrou.
 *
 * <h2>Les sorties</h2>
 *
 * Le bouton, Échap et Tab — deux façons de demander la sortie — et les touches
 * de défilement, qui valent un clic. La molette et le doigt ne sont pas
 * écoutés : c'est une mise en scène, pas un piège, et le bouton reste visible en
 * permanence.
 *
 * La préférence « moins de mouvement » ne lève pas le verrou, seulement le
 * défilement animé qui suit sa levée : cette préférence porte sur le mouvement,
 * et retenir une page n'en produit aucun.
 *
 * <h2>La couverture doit tenir</h2>
 *
 * CYBERAS pouvait se contenter d'un seuil de hauteur fixe : sa couverture est
 * contrainte à exactement un écran. Celle de VOLTA montre huit cartes à leur
 * taille pleine, et sa hauteur dépend donc de la largeur de la fenêtre, du corps
 * de texte et du repli des titres — elle n'est pas connue d'avance.
 *
 * Un verrou posé sur une couverture plus haute que la fenêtre cache son propre
 * bouton : le visiteur est retenu sur une page sans la sortie qu'on lui promet.
 * La hauteur réelle est donc mesurée après la mise en page, et le verrou se
 * retire de lui-même s'il ne peut pas tenir. Mieux vaut une page qui défile
 * qu'une page figée sur un bouton invisible.
 */
export function useCoverLock() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [locked, setLocked] = useState(() => {
    if (typeof window === 'undefined') return false
    /* Pas de verrou sur un écran étroit ni bas : en dessous de 1024 px la
       couverture s'empile en une colonne et dépasse la hauteur disponible.
       Retenir la page y reviendrait à cacher du contenu derrière un défilement
       qu'on vient d'interdire. */
    if (window.innerWidth < 1024 || window.innerHeight < 520) return false
    return window.scrollY <= 40
  })

  /**
   * Mesure la couverture et renonce si elle ne tient pas.
   *
   * La marge de 8 px absorbe les arrondis de sous-pixel : sans elle, une
   * couverture à la hauteur exacte de la fenêtre se voit refuser le verrou une
   * fois sur deux selon le facteur de zoom.
   */
  useEffect(() => {
    if (!locked) return
    const section = sectionRef.current
    if (!section) return

    const verifier = () => {
      if (section.offsetHeight > window.innerHeight + 8) setLocked(false)
    }

    verifier()
    // Les photos des cartes arrivent après le premier rendu et rallongent la
    // couverture : une mesure unique conclurait qu'elle tient, alors qu'elle
    // grandit encore. L'observateur suit chaque changement de hauteur.
    const observateur = new ResizeObserver(verifier)
    observateur.observe(section)
    window.addEventListener('resize', verifier)

    return () => {
      observateur.disconnect()
      window.removeEventListener('resize', verifier)
    }
  }, [locked])

  useEffect(() => {
    if (!locked) return
    if (window.scrollY > 40) {
      setLocked(false)
      return
    }

    const racine = document.documentElement
    const corps = document.body
    const precedentRacine = racine.style.overflow
    const precedentCorps = corps.style.overflow

    racine.style.overflow = 'hidden'
    corps.style.overflow = 'hidden'
    // Repère d'inspection : quand le verrou manque, la question est toujours de
    // savoir s'il n'a pas été posé ou s'il a été défait.
    racine.dataset.coverLock = 'on'

    return () => {
      racine.style.overflow = precedentRacine
      corps.style.overflow = precedentCorps
      delete racine.dataset.coverLock
    }
  }, [locked])

  /**
   * Libère la page et l'amène à la section suivante : un clic sur « Découvrir »
   * demande la suite, pas un aperçu.
   */
  const reveal = () => {
    setLocked(false)

    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const suivante = sectionRef.current?.nextElementSibling as HTMLElement | null
        const cible = suivante
          ? suivante.getBoundingClientRect().top + window.scrollY
          : (sectionRef.current?.offsetHeight ?? window.innerHeight)

        window.scrollTo({ top: cible, behavior: reduit ? 'auto' : 'smooth' })
      })
    })
  }

  useEffect(() => {
    if (!locked) return

    const defilement = new Set(['PageDown', 'ArrowDown', 'End', ' ', 'Spacebar'])
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Tab') {
        setLocked(false)
        return
      }
      if (defilement.has(e.key)) {
        e.preventDefault()
        reveal()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // `reveal` ne dépend d'aucun état : le recréer à chaque rendu ne change rien
    // à ce que l'écouteur fait.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked])

  return { sectionRef, locked, reveal }
}
