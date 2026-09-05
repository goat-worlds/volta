import { useMemo } from 'react'
import { useStore } from './StoreContext'
import type { Role } from './types'

/**
 * Ce qui attend l'utilisateur, rubrique par rubrique.
 *
 * Un compteur global de notifications dit qu'il s'est passé quelque chose, pas
 * ce qu'il reste à faire ni où. Les pastilles de la navigation comptent le
 * travail réellement en attente dans chaque rubrique — les engins à assigner,
 * les rapports à trancher, les devis à chiffrer — et retombent d'elles-mêmes
 * quand ce travail est fait, sans qu'on ait à « marquer comme lu ».
 *
 * Les notifications gardent leur propre pastille : elles disent ce qui vient
 * d'arriver, les rubriques disent ce qui reste ouvert. Les deux ne se
 * remplacent pas.
 *
 * @returns un compte par chemin de navigation ; zéro ou absent n'affiche rien.
 */
export function useShellBadges(role: Role): Record<string, number> {
  const {
    currentUser, equipment, inspections, rentalRequests, myQuoteRequests, myQuotes,
  } = useStore()

  return useMemo(() => {
    const counts: Record<string, number> = {}
    const me = currentUser?.id
    if (!me) return counts

    if (role === 'SUPPLIER') {
      const mine = equipment.filter((e) => e.supplierId === me)
      // Les demandes auxquelles ce fournisseur n'a pas encore répondu.
      const answered = new Set(myQuotes.map((q) => q.quoteRequestId))
      counts['/supplier/equipment'] = mine.filter(
        (e) => e.status === 'DRAFT' || e.status === 'CORRECTIONS_REQUESTED',
      ).length
      counts['/supplier/demandes'] = myQuoteRequests.filter(
        (r) => r.status === 'PENDING' && !answered.has(r.id),
      ).length
      counts['/supplier/locations'] = rentalRequests.filter(
        (r) => r.supplierId === me && r.status === 'PENDING',
      ).length
    }

    if (role === 'TECHNICAL') {
      // Une mission compte tant que son rapport n'est pas parti.
      counts['/technical/missions'] = inspections.filter(
        (i) => i.technicalTeamId === me && i.status !== 'DONE',
      ).length
    }

    if (role === 'ADMIN') {
      counts['/admin/inspections'] = equipment.filter((e) => e.status === 'SUBMITTED').length
      counts['/admin/reports'] = equipment.filter((e) => e.status === 'PENDING_ADMIN_REVIEW').length
      counts['/admin/requests'] = rentalRequests.filter((r) => r.status === 'PENDING').length
    }

    if (role === 'CLIENT') {
      // Seuls les devis appellent une décision du client ; ses demandes en
      // attente dépendent du fournisseur, les compter le presserait pour rien.
      counts['/client/devis'] = myQuotes.filter((q) => q.status === 'SENT').length
    }

    return counts
  }, [role, currentUser?.id, equipment, inspections, rentalRequests, myQuoteRequests, myQuotes])
}
