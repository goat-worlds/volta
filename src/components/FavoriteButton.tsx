import { Heart } from 'lucide-react'
import { useStore } from '../store/StoreContext'

/**
 * Bascule un engin dans la sélection de l'utilisateur.
 *
 * Le bouton se pose sur une carte qui est elle-même un lien : sans arrêter la
 * propagation, un clic sur le cœur ouvrirait la fiche au lieu d'enregistrer.
 *
 * Rien ne s'affiche pour un visiteur non connecté : proposer une sélection
 * qu'on ne saurait pas rattacher à un compte reviendrait à promettre une
 * mémoire qu'on n'a pas.
 */
export default function FavoriteButton({
  equipmentId,
  className = '',
}: {
  equipmentId: string
  className?: string
}) {
  const { currentUser, isFavorite, toggleFavorite } = useStore()
  if (!currentUser) return null

  const active = isFavorite(equipmentId)

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      title={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(equipmentId)
      }}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
        active
          ? 'border-red-200 bg-white text-red-500 hover:bg-red-50'
          : 'border-slate-200 bg-white/90 text-slate-400 hover:text-red-500'
      } ${className}`}
    >
      <Heart size={15} fill={active ? 'currentColor' : 'none'} />
    </button>
  )
}
