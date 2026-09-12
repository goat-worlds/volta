import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import type { Role } from '../store/types'
import { Forbidden, SessionExpired } from '../pages/errors'

/**
 * Protège un espace connecté.
 *
 * Sans cette garde, /admin s'ouvrait pour un visiteur : l'API refusait bien les
 * appels, mais l'écran s'affichait vide. L'utilisateur voyait une application
 * cassée là où il aurait dû voir un refus.
 *
 * Trois refus distincts :
 *   - session expirée : le serveur a rejeté le jeton pendant la navigation ;
 *     on le dit, avec un bouton qui ramène ici après reconnexion ;
 *   - pas de session : on renvoie vers la connexion en mémorisant la
 *     destination, pour y revenir une fois identifié ;
 *   - mauvais rôle : on l'écrit — « accès refusé » — plutôt que de rediriger
 *     sans un mot. La page propose le retour vers son propre espace, si bien
 *     qu'il n'est jamais sans issue.
 */

// Le point d'entrée de chaque rôle vit avec la navigation ; il est réexporté
// ici pour les écrans qui l'importaient déjà.
export { HOME_BY_ROLE } from '../lib/navigation'

export default function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { currentUser, sessionExpired } = useStore()
  const location = useLocation()

  if (!currentUser) {
    if (sessionExpired) return <SessionExpired />
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  }

  // L'administrateur supervise l'ensemble : lui fermer un espace l'empêcherait
  // de constater ce que voit l'utilisateur qu'il assiste.
  if (currentUser.role !== role && currentUser.role !== 'ADMIN') {
    return <Forbidden />
  }

  return <>{children}</>
}
