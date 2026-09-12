import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import JourneyForm from '../../components/requests/JourneyForm'
import { journeyFor } from '../../lib/journeys'
import type { IntentId } from '../../types/domain'

/**
 * Page d'un parcours.
 *
 * Une seule page sert les huit intentions : l'adresse choisit la définition,
 * le formulaire fait le reste. Ajouter un neuvième parcours demandera une
 * définition et une route, pas un écran de plus à tenir à jour.
 */
export default function JourneyPage({ intent }: { intent: IntentId }) {
  const journey = journeyFor(intent)

  if (!journey) {
    // Route déclarée sans définition correspondante : c'est une erreur de
    // câblage, pas une impasse pour l'utilisateur — on le ramène au choix.
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertTriangle size={22} />
        </span>
        <h1 className="mt-4 text-xl font-bold text-acier-900">Ce parcours n’est pas disponible.</h1>
        <Link
          to="/#intentions"
          className="mt-6 inline-block rounded-lg bg-acier-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Voir tous les parcours
        </Link>
      </div>
    )
  }

  return <JourneyForm journey={journey} />
}
