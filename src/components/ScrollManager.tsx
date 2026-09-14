import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Défilement à la navigation.
 *
 * Le routeur ne touche pas à la position de la page : on arrivait sur une
 * fiche Market au milieu de l'écran, et un lien vers « /#intentions » depuis
 * une autre page n'atteignait jamais sa cible, la section n'étant pas encore
 * rendue au moment du changement d'adresse.
 *
 * Sans ancre, on remonte en haut. Avec une ancre, on cherche l'élément une
 * fois le rendu passé, et on y va — l'en-tête collant est compensé par les
 * `scroll-mt` des sections visées.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 })
      return
    }
    const id = decodeURIComponent(hash.slice(1))
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}
