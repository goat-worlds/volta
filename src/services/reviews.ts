import { apiGet, apiPost } from '../store/api'

/**
 * Les avis des clients sur les engins.
 *
 * Lus sans compte — c'est même à ce moment-là qu'ils servent, quand on hésite
 * encore. Écrits seulement par qui a loué la machine, ce que le serveur
 * vérifie dans les réservations avant d'accepter la ligne : l'écran ne fait que
 * cacher le formulaire à qui ne peut pas s'en servir.
 */
export interface Review {
  id: string
  /** De 1 à 5. */
  rating: number
  comment: string
  createdAt: string
}

/** La moyenne d'un engin, pour l'étoile des vignettes. */
export interface ReviewSummary {
  equipmentId: string
  average: number
  count: number
}

export const listReviews = (equipmentId: string) =>
  apiGet<Review[]>(`/equipment/${equipmentId}/reviews`)

/**
 * Toutes les moyennes en un appel.
 *
 * Le catalogue affiche l'étoile sur chaque vignette : les demander engin par
 * engin ferait une requête par carte, rechargées à chaque tour de
 * synchronisation.
 */
export const listReviewSummaries = () =>
  apiGet<ReviewSummary[]>('/equipment/reviews/summaries')

/** Le formulaire ne s'affiche qu'à qui peut s'en servir. */
export const mayReview = (equipmentId: string) =>
  apiGet<{ allowed: boolean }>(`/equipment/${equipmentId}/reviews/may-post`)
    .then((r) => r.allowed)
    .catch(() => false)

export const postReview = (equipmentId: string, rating: number, comment: string) =>
  apiPost<Review>(`/equipment/${equipmentId}/reviews`, { rating, comment })
