/**
 * Volta Market — client de /api/market.
 *
 * Contrairement aux parcours de demande (services/requests), ce module est
 * servi par le serveur : les annonces, leur publication, les demandes d'offre
 * et leur suivi vivent en base. La vitrine et la demande d'offre se consultent
 * sans compte ; le reste passe par le jeton de session.
 */
import { apiGet, apiPost, apiPut } from '../store/api'
import type {
  ListingInput,
  PublicListing,
  PurchaseInput,
  PurchaseRequest,
  PurchaseTracking,
  SaleListing,
} from '../store/types'

// --- Vitrine ---

export const listPublishedListings = () => apiGet<PublicListing[]>('/market/listings')

export const getListing = (id: string) => apiGet<PublicListing>(`/market/listings/${id}`)

export const requestOffer = (listingId: string, input: PurchaseInput) =>
  apiPost<PurchaseRequest>(`/market/listings/${listingId}/requests`, input)

export const trackPurchase = (reference: string) =>
  apiGet<PurchaseTracking>(`/market/requests/track/${encodeURIComponent(reference.trim())}`)

// --- Vendeur ---

export const listMyListings = () => apiGet<SaleListing[]>('/market/listings/mine')

export const createListing = (input: ListingInput) => apiPost<SaleListing>('/market/listings', input)

export const updateListing = (id: string, input: Partial<ListingInput>) =>
  apiPut<SaleListing>(`/market/listings/${id}`, input)

export const submitListing = (id: string) => apiPost<SaleListing>(`/market/listings/${id}/submit`)

export const withdrawListing = (id: string) => apiPost<SaleListing>(`/market/listings/${id}/withdraw`)

// --- Équipe VOLTA ---

export const publishListing = (id: string) => apiPost<SaleListing>(`/market/listings/${id}/publish`)

export const rejectListing = (id: string, note: string) =>
  apiPost<SaleListing>(`/market/listings/${id}/reject`, { note })

export const featureListing = (id: string, featured: boolean) =>
  apiPost<SaleListing>(`/market/listings/${id}/feature`, { featured })

export const markListingSold = (id: string) => apiPost<SaleListing>(`/market/listings/${id}/sold`)

export const listPurchaseRequests = () => apiGet<PurchaseRequest[]>('/market/requests')

export const movePurchaseStage = (
  id: string,
  stage: string,
  notes?: string,
  offerAmount?: number,
) => apiPost<PurchaseRequest>(`/market/requests/${id}/stage`, { stage, notes, offerAmount })

/** Adresse d'une annonce, selon l'espace d'où on la regarde. */
export const listingPath = (id: string, pathname: string) =>
  pathname.startsWith('/client') ? `/client/market/${id}` : `/market/${id}`
