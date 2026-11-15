import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { getToken } from '../store/api'

/**
 * Une image que le serveur ne livre qu'aux rôles habilités.
 *
 * <h2>Pourquoi une balise `img` ne suffit pas</h2>
 *
 * La session de VOLTA voyage dans l'en-tête `X-Session-Token`, lu depuis le
 * stockage local. Le navigateur ne l'ajoute qu'aux requêtes que le code
 * déclenche lui-même : une balise `<img src>` part sans jeton, le serveur
 * refuse, et l'écran affiche une image cassée.
 *
 * C'est ce qui arrivait aux photos d'inspection. Les photos d'engins y
 * échappaient parce que leur route est publique — d'où un défaut qui ne touchait
 * qu'une partie des images et paraissait inexplicable.
 *
 * Le projet connaissait pourtant le problème : {@link apiDownload} le décrit
 * pour les pièces jointes, où un lien `<a href>` échoue de la même façon. Le
 * raisonnement n'avait simplement jamais été appliqué aux images.
 *
 * <h2>Ce que fait ce composant</h2>
 *
 * Il demande le fichier lui-même, avec le jeton, et le montre depuis la mémoire
 * du navigateur. L'adresse ainsi fabriquée est libérée au démontage : sans
 * cela, chaque passage sur une fiche d'inspection laisserait derrière lui le
 * poids des photos qu'elle contient.
 *
 * <h2>Un échec se voit</h2>
 *
 * Une image qui ne vient pas affiche un cadre et une raison, pas une icône
 * cassée. Un technicien doit savoir si le cliché manque parce qu'il n'a jamais
 * été envoyé ou parce qu'on ne le lui montre pas.
 */

type Etat = 'chargement' | 'affichee' | 'echec'

export default function ImageProtegee({
  src,
  alt = '',
  className = '',
}: {
  src: string
  alt?: string
  className?: string
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [etat, setEtat] = useState<Etat>('chargement')

  useEffect(() => {
    let vivant = true
    let objet: string | null = null
    setEtat('chargement')

    const token = getToken()
    fetch(src, { headers: token ? { 'X-Session-Token': token } : {} })
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
      .then((blob) => {
        if (!vivant) return
        objet = URL.createObjectURL(blob)
        setUrl(objet)
        setEtat('affichee')
      })
      .catch(() => {
        if (vivant) setEtat('echec')
      })

    return () => {
      vivant = false
      // Libérée ici et non au chargement de la suivante : une fiche qui porte
      // dix clichés en retiendrait sinon dix en mémoire jusqu'à la fermeture
      // de l'onglet.
      if (objet) URL.revokeObjectURL(objet)
    }
  }, [src])

  if (etat === 'affichee' && url) {
    return <img src={url} alt={alt} className={className} />
  }

  return (
    <span
      className={`grid place-items-center border border-dashed border-papier-300 bg-papier-50 text-papier-400 ${className}`}
      title={etat === 'echec' ? "Cette image n'a pas pu être chargée." : undefined}
    >
      {etat === 'echec' ? (
        <ImageOff size={16} aria-hidden />
      ) : (
        <span className="text-[10px] uppercase tracking-wide">…</span>
      )}
      <span className="sr-only">
        {etat === 'echec' ? "Image indisponible" : 'Chargement de l’image'}
      </span>
    </span>
  )
}
