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

/**
 * Le compteur public de « j'aime ».
 *
 * À ne pas confondre avec les favoris, qui rangent une machine dans la liste
 * de celui qui l'a mise de côté. Celui-ci est un signal public : il dit aux
 * autres que cette machine plaît. Un favori retiré ne doit pas faire baisser
 * une note publique, ce que personne n'attend en vidant sa liste.
 */
export interface LikeState {
  equipmentId: string
  count: number
  /** Vrai si l'appelant a déjà voté. Faux pour un visiteur sans compte. */
  liked: boolean
}

export const listLikes = () => apiGet<LikeState[]>('/equipment/likes')

export const toggleLike = (equipmentId: string) =>
  apiPost<LikeState>(`/equipment/${equipmentId}/like`)
