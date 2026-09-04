import { apiGet, apiPost } from './api'

/**
 * Client du workflow de devis.
 *
 * Séparé de api.ts, qui n'est qu'une couche de transport : y ajouter la logique
 * métier mêlerait le « comment on appelle » au « ce qu'on appelle ».
 *
 * Les types reprennent exactement les champs renvoyés par le backend. Toute
 * divergence produirait un undefined silencieux à l'écran plutôt qu'une erreur
 * repérable.
 */

/** SENT dès la création, puis ACCEPTED ou REJECTED — les deux terminaux. */
export type QuoteStatus = 'SENT' | 'ACCEPTED' | 'REJECTED'

/** PENDING tant qu'aucun devis n'est retenu. */
export type QuoteRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

export interface QuoteRequest {
  id: string
  equipmentId: string
  clientId: string
  supplierId: string
  status: QuoteRequestStatus
  message: string
  quantity: number
  startDate: string
  endDate: string
  clientName: string
  clientPhone: string
  clientEmail: string
  createdAt: string
}

export interface Quote {
  id: string
  quoteRequestId: string
  supplierId: string
  /** Montant en FCFA, entier : le modèle backend n'utilise pas de décimales. */
  price: number
  /** Délai de mise à disposition, en jours. Zéro signifie immédiat. */
  deliveryTime: number
  conditions: string
  status: QuoteStatus
  validUntil: string
  createdAt: string
}

export interface CreateQuoteRequestPayload {
  equipmentId: string
  message: string
  quantity: number
  startDate: string
  endDate: string
  clientName: string
  clientPhone: string
  clientEmail: string
}

export interface CreateQuotePayload {
  quoteRequestId: string
  price: number
  deliveryTime: number
  conditions: string
  validUntil: string
}

export const quoteRequestsClient = {
  /**
   * Demandes émises par un client.
   * Le backend refuse la consultation des demandes d'autrui.
   */
  listByClient: (clientId: string) =>
    apiGet<QuoteRequest[]>(`/quote-requests/client/${clientId}`),

  /** Demandes adressées à un fournisseur. */
  listBySupplier: (supplierId: string) =>
    apiGet<QuoteRequest[]>(`/quote-requests/supplier/${supplierId}`),

  /** Détail, accessible aux deux parties de la demande. */
  getById: (id: string) => apiGet<QuoteRequest>(`/quote-requests/${id}`),

  /**
   * Le clientId n'est pas transmis : le backend l'établit à partir du jeton.
   * L'envoyer permettrait de déposer une demande au nom d'un autre.
   */
  create: (payload: CreateQuoteRequestPayload) =>
    apiPost<QuoteRequest>('/quote-requests', payload),
}

export const quotesClient = {
  /**
   * Devis reçus pour une demande. C'est la vue de comparaison du client ; un
   * fournisseur n'y voit que ses propres offres.
   */
  listByRequest: (requestId: string) =>
    apiGet<Quote[]>(`/quotes/request/${requestId}`),

  /** Devis émis par un fournisseur. */
  listBySupplier: (supplierId: string) =>
    apiGet<Quote[]>(`/quotes/supplier/${supplierId}`),

  getById: (id: string) => apiGet<Quote>(`/quotes/${id}`),

  /** Le supplierId est établi côté serveur, pour la même raison. */
  create: (payload: CreateQuotePayload) => apiPost<Quote>('/quotes', payload),

  /**
   * Accepte un devis. Le backend crée la demande de location dans la même
   * transaction et refuse un devis déjà tranché ou expiré.
   */
  accept: (id: string) => apiPost<Quote>(`/quotes/${id}/accept`),

  reject: (id: string) => apiPost<Quote>(`/quotes/${id}/reject`),
}

/** Prix total indicatif, calculé pour l'affichage seul. */
export function estimateTotal(quote: Quote, request: QuoteRequest): number | null {
  const start = Date.parse(request.startDate)
  const end = Date.parse(request.endDate)
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return null
  }
  // Une location d'un seul jour compte pour un jour, pas zéro.
  const days = Math.max(1, Math.round((end - start) / 86_400_000) + 1)
  return quote.price * days * Math.max(1, request.quantity)
}

/** Formatage monétaire FCFA, sans décimales. */
export function formatFcfa(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' FCFA'
}
