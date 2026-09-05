import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import type { Role } from '../store/types'

/**
 * Protège un espace connecté.
 *
 * Sans cette garde, /admin s'ouvrait pour un visiteur : l'API refusait bien les
 * appels, mais l'écran s'affichait vide. L'utilisateur voyait une application
 * cassée là où il aurait dû voir un refus.
 *
 * Deux refus distincts :
 *   - pas de session : on renvoie vers la connexion en mémorisant la
 *     destination, pour y revenir une fois identifié ;
 *   - mauvais rôle : on renvoie vers l'espace de son propre rôle, plutôt que
 *     vers une page d'erreur qui laisserait l'utilisateur sans issue.
 */

/** Point d'entrée de chaque rôle, après connexion ou redirection. */
export const HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: '/admin',
  SUPPLIER: '/supplier',
  TECHNICAL: '/technical',
  CLIENT: '/client',
}

export default function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { currentUser } = useStore()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  }

  // L'administrateur supervise l'ensemble : lui fermer un espace l'empêcherait
  // de constater ce que voit l'utilisateur qu'il assiste.
  if (currentUser.role !== role && currentUser.role !== 'ADMIN') {
    return <Navigate to={HOME_BY_ROLE[currentUser.role] ?? '/'} replace />
  }

  return <>{children}</>
}
