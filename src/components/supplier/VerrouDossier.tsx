import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { apiGet } from '../../store/api'
import { useStore } from '../../store/StoreContext'

/**
 * Le bandeau qui dit ce qui est fermé, et comment l'ouvrir.
 *
 * <h2>Pourquoi devant l'écran et non seulement au refus</h2>
 *
 * Un fournisseur qui remplit une annonce entière avant d'apprendre qu'il ne
 * peut pas la déposer tient le refus pour une panne. Le verrou doit se voir
 * avant l'effort, pas après.
 *
 * <h2>Pourquoi il disparaît</h2>
 *
 * Un compte vérifié ne voit rien : répéter à quelqu'un qu'il est en règle
 * occupe la place de ce qu'il est venu faire.
 */

interface Dossier {
  rccm: string
  dfe: string
  verifie: boolean
  enginsAuParc: number
  plafondSansPieces: number
}

export default function VerrouDossier({ sujet }: { sujet: 'market' | 'parc' }) {
  const { currentUser } = useStore()
  const [dossier, setDossier] = useState<Dossier | null>(null)

  useEffect(() => {
    if (currentUser?.role !== 'SUPPLIER') return
    let vivant = true
    apiGet<Dossier>('/me/documents')
      .then((d) => {
        if (vivant) setDossier(d)
      })
      // Le bandeau est une aide, pas une fonction : s'il échoue, l'écran
      // reste utilisable et le serveur refusera avec son propre message.
      .catch(() => undefined)
    return () => {
      vivant = false
    }
  }, [currentUser?.role])

  if (!dossier || dossier.verifie) return null
  if (sujet === 'parc' && dossier.enginsAuParc < dossier.plafondSansPieces) return null

  const depose = Boolean(dossier.rccm && dossier.dfe)

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex min-w-0 items-start gap-3 text-sm">
        <Lock size={18} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
        <div>
          <div className="font-semibold text-acier-900">
            {sujet === 'market'
              ? 'La vente demande un dossier vérifié'
              : `Vous avez atteint ${dossier.plafondSansPieces} engins au parc`}
          </div>
          <p className="text-papier-700">
            {depose
              ? 'Votre RCCM et votre DFE sont déposés. VOLTA les vérifie ; vous serez prévenu dès la validation.'
              : sujet === 'market'
                ? 'Déposez votre RCCM et votre DFE pour ouvrir la vente sur Volta Market.'
                : 'Déposez votre RCCM et votre DFE pour publier sans limite.'}
          </p>
        </div>
      </div>
      {!depose && (
        <Link
          to="/supplier/dossier"
          className="shrink-0 rounded-lg bg-acier-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-acier-800"
        >
          Compléter mon dossier
        </Link>
      )}
    </div>
  )
}
