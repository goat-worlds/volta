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
 * <h2>La couverture plus haute que l'écran</h2>
 *
 * Celle de VOLTA montre huit cartes à leur taille pleine : sa hauteur dépend de
 * la largeur de la fenêtre, du corps de texte et du repli des titres, et sur un
 * téléphone elle dépasse largement l'écran.
 *
 * Le verrou se retirait alors de lui-même, pour ne pas cacher son propre bouton
 * derrière un défilement qu'il venait d'interdire. C'était renoncer au verrou
 * là où il sert le plus — la plupart des visiteurs arrivent par téléphone, et
 * la page y filait sous le doigt sans qu'ils aient vu un seul parcours.
 *
 * Deux choses ont levé la contrainte. Le bouton est posé en `fixed` sur la
 * fenêtre, donc il ne peut pas être caché, quelle que soit la hauteur de la
 * couverture. Et celle-ci défile dans ses propres bornes : on parcourt les huit
 * cartes, on ne passe pas au-delà.
 */
export function useCoverLock() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [locked, setLocked] = useState(() => {
    if (typeof window === 'undefined') return false
    /*
     * Le verrou vaut à toutes les largeurs.
     *
     * Il était désactivé en dessous de 1024 px, au motif que la couverture s'y
     * empile en une colonne plus haute que l'écran : la retenir aurait caché
     * les dernières cartes derrière un défilement qu'on venait d'interdire.
     *
     * C'était renoncer au verrou là où il sert le plus. La plupart des
     * visiteurs arrivent par téléphone, et c'est précisément là que la page
     * filait sous le doigt sans qu'ils aient vu un seul parcours.
     *
     * La couverture défile désormais dans ses propres bornes : on parcourt les
     * huit cartes, on ne passe pas au-delà. Voir `IntentGrid`, qui en fait sa
     * propre zone de défilement tant que le verrou tient.
     *
     * Reste un garde-fou : sous 360 px de haut — un téléphone couché, clavier
     * ouvert — il ne resterait de place ni pour une carte ni pour le bouton.
     */
    if (window.innerHeight < 360) return false
    return window.scrollY <= 40
  })

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
