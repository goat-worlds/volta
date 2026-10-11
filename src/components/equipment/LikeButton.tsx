import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { listLikes, toggleLike } from '../../services/reviews'
import { useStore } from '../../store/StoreContext'
import { useToast } from '../feedback/Toaster'

/**
 * Le compteur public de « j'aime » d'un engin.
 *
 * <h2>Ce qu'il n'est pas</h2>
 *
 * Ce n'est pas le favori. Le favori est privé : il range une machine dans sa
 * propre liste pour la retrouver. Celui-ci est public : il dit aux autres que
 * cette machine plaît. Les confondre exposerait ce que chacun avait mis de
 * côté — et vider sa liste de favoris ferait baisser une note publique, ce que
 * personne n'attend.
 *
 * <h2>Sans compte</h2>
 *
 * Le compteur se lit, le vote est refusé : un compteur anonyme se gonfle en
 * rechargeant la page. Le clic mène alors à la connexion, en gardant l'adresse
 * de la fiche pour y revenir — plutôt que d'afficher un refus sec à quelqu'un
 * qui voulait dire qu'il aime.
 */
export default function LikeButton({ equipmentId }: { equipmentId: string }) {
  const { currentUser } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [etat, setEtat] = useState<{ count: number; liked: boolean }>({ count: 0, liked: false })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let annule = false
    void listLikes()
      .then((tous) => {
        if (annule) return
        const mien = tous.find((l) => l.equipmentId === equipmentId)
        setEtat({ count: mien?.count ?? 0, liked: mien?.liked ?? false })
      })
      .catch(() => {})
    return () => {
      annule = true
    }
  }, [equipmentId])

  const cliquer = async () => {
    if (!currentUser) {
      navigate('/connexion', { state: { from: `/equipment/${equipmentId}` } })
      return
    }
    setBusy(true)
    try {
      const maj = await toggleLike(equipmentId)
      setEtat({ count: maj.count, liked: maj.liked })
    } catch (e) {
      toast.fromError(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void cliquer()}
      aria-pressed={etat.liked}
      aria-label={`${etat.count} personne${etat.count > 1 ? 's aiment' : ' aime'} cet engin`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
        etat.liked
          ? 'border-red-200 bg-red-50 text-red-600'
          : 'border-papier-200 bg-white text-acier-700 hover:border-red-200 hover:text-red-600'
      }`}
    >
      <Heart size={15} aria-hidden className={etat.liked ? 'fill-current' : ''} />
      {etat.count > 0 && <span>{etat.count}</span>}
      <span className={etat.count > 0 ? 'sr-only' : ''}>J’aime</span>
    </button>
  )
}
