export type EquipmentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_INSPECTION'
  | 'INSPECTION_IN_PROGRESS'
  | 'REPORT_SUBMITTED'
  | 'PENDING_ADMIN_REVIEW'
  | 'REJECTED'
  | 'CORRECTIONS_REQUESTED'
  | 'REFERENCED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'

export type Level = 'BASIC' | 'SILVER' | 'GOLD'

export type Role = 'ADMIN' | 'SUPPLIER' | 'TECHNICAL' | 'CLIENT'

export interface User {
  id: string
  name: string
  role: Role
  company: string
  email: string
  phone: string
  city: string
}

export interface Category {
  id: string
  name: string
  icon: string
}

export interface Equipment {
  id: string
  name: string
  categoryId: string
  brand: string
  model: string
  year: number
  hours: number
  location: string
  pricePerDay: number
  available: boolean
  withOperator: boolean
  description: string
  photos: string[]
  documents: { name: string; type: string }[]
  supplierId: string
  status: EquipmentStatus
  level: Level | null
  declaredCondition: string
  createdAt: string
}

export type CheckResult = 'CONFORME' | 'A_SURVEILLER' | 'NON_CONFORME' | null

export interface ChecklistItem {
  section: string
  label: string
  result: CheckResult
  observation: string
}

export interface Inspection {
  id: string
  equipmentId: string
  technicalTeamId: string
  assignedAt: string
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'DONE'
  checklist: ChecklistItem[]
  photos: string[]
  anomalies: string[]
  /** Papiers de douane televerses par le technicien. */
  customsDocuments?: string[]
  /** Moyens de deplacement de l equipe mecanique du fournisseur. */
  teamMobility?: string | null
  /** Delai reel de mise a disposition constate sur place. */
  availabilityLeadTime?: string | null
}

export interface Report {
  id: string
  inspectionId: string
  equipmentId: string
  submittedAt: string
  summary: string
  checklist: ChecklistItem[]
}

/**
 * Parcours d'une réservation, tel que le serveur le tient (RentalWorkflow) :
 *   PENDING → QUALIFIED → ACCEPTED → CONFIRMED → IN_PROGRESS → COMPLETED
 * avec sorties DECLINED (fournisseur) et CANCELLED (administration).
 */
export type RentalStatus =
  | 'PENDING'
  | 'QUALIFIED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

/** Transitions que l'administration déclenche ; accept/decline restent au fournisseur. */
export type RentalAdminAction = 'qualify' | 'confirm' | 'start' | 'complete' | 'cancel'

export interface RentalRequest {
  id: string
  reference: string
  equipmentId: string
  supplierId: string
  clientId?: string | null
  startDate: string
  endDate: string
  location: string
  withOperator: boolean
  transport: boolean
  comment: string
  clientName: string
  clientPhone: string
  clientEmail: string
  status: RentalStatus
  adminNote?: string | null
  createdAt: string
  updatedAt?: string | null
}

/** Pipeline commercial (OpportunityWorkflow) : NEW → … → WON, LOST depuis toute étape ouverte. */
export type OpportunityStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST'

export interface Opportunity {
  id: string
  reference: string
  title: string
  stage: OpportunityStage
  clientId?: string | null
  prospectName?: string | null
  prospectCompany?: string | null
  prospectContact?: string | null
  ownerId?: string | null
  linkedType?: string | null
  linkedId?: string | null
  amount?: number | null
  notes?: string | null
  createdAt: string
  updatedAt?: string | null
  closedAt?: string | null
}

export interface OpportunityInput {
  title: string
  clientId?: string | null
  prospectName?: string | null
  prospectCompany?: string | null
  prospectContact?: string | null
  ownerId?: string | null
  linkedType?: string | null
  linkedId?: string | null
  amount?: number | null
  notes?: string | null
}

/** Anomalie relevée en vérification (AnomalyWorkflow). */
export type AnomalyStatus = 'OPEN' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED'
export type AnomalySeverity = 'MINEURE' | 'MAJEURE' | 'CRITIQUE'

export interface Anomaly {
  id: string
  reference: string
  inspectionId: string
  equipmentId: string
  origin?: string | null
  description: string
  severity: AnomalySeverity
  status: AnomalyStatus
  reportedBy?: string | null
  assignedTo?: string | null
  correctiveAction?: string | null
  reviewNote?: string | null
  createdAt: string
  updatedAt?: string | null
  resolvedAt?: string | null
}

export interface AuditEvent {
  id: string
  at: string
  actorId?: string | null
  actorName?: string | null
  actorRole?: string | null
  action: string
  entityType: string
  entityId: string
  entityReference?: string | null
  details?: string | null
}

export interface AuthUser {
  id: string
  name: string
  role: Role
  company: string
  email: string
  phone: string
  city: string
}

export interface Notification {
  id: string
  role: Role
  message: string
  date: string
  read: boolean
}

export type QuoteRequestStatus = 'AWAITING_VALIDATION' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REJECTED'

export interface QuoteRequest {
  id: string
  equipmentId: string
  clientId: string
  supplierId: string
  status: QuoteRequestStatus
  message?: string
  quantity: number
  startDate: string
  endDate: string
  clientName: string
  clientPhone: string
  clientEmail: string
  createdAt: string
}

export type QuoteStatus = 'SENT' | 'ACCEPTED' | 'REJECTED'

export interface Quote {
  id: string
  quoteRequestId: string
  supplierId: string
  price: number
  deliveryTime: number
  conditions: string
  status: QuoteStatus
  validUntil: string
  createdAt: string
}

/* ------------------------------------------------------------------ */
/* Volta Market — servi par /api/market                                 */
/* ------------------------------------------------------------------ */

export type ListingStatus = 'DRAFT' | 'SUBMITTED' | 'PUBLISHED' | 'REJECTED' | 'WITHDRAWN' | 'SOLD'

export type ListingCondition = 'NEUF' | 'OCCASION'

/** Ce que la vitrine publique reçoit : jamais l'identité du vendeur. */
export interface PublicListing {
  id: string
  reference: string
  title: string
  categoryId: string
  brand: string
  model: string
  year: number | null
  hours: number | null
  location: string
  condition: ListingCondition
  askingPrice: number
  negotiable: boolean
  description: string
  photos: string[]
  documents: { name: string; type: string }[]
  featured: boolean
  publishedAt: string | null
}

/** L'annonce telle que le vendeur et l'administration la voient. */
export interface SaleListing extends PublicListing {
  equipmentId: string | null
  sellerId: string
  status: ListingStatus
  reviewNote: string | null
  createdAt: string
  updatedAt: string
  soldAt: string | null
}

export interface ListingInput {
  title: string
  categoryId: string
  brand: string
  model: string
  year: number | null
  hours: number | null
  location: string
  condition: ListingCondition
  askingPrice: number
  negotiable: boolean
  description: string
  photos: string[]
  documents: { name: string; type: string }[]
  equipmentId?: string | null
}

export type PurchaseStage =
  | 'RECEIVED'
  | 'QUALIFYING'
  | 'AVAILABILITY_CHECK'
  | 'COMMERCIAL_REVIEW'
  | 'OFFER'
  | 'NEGOTIATION'
  | 'VALIDATED'
  | 'SOLD'
  | 'DELIVERED'
  | 'CLOSED'

export interface PurchaseRequest {
  id: string
  reference: string
  listingId: string
  sellerId: string
  clientId: string | null
  contactName: string
  contactCompany: string
  contactPhone: string
  contactEmail: string
  contactCity: string
  quantity: number
  message: string
  status: PurchaseStage
  offerAmount: number | null
  notes: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseInput {
  contactName: string
  contactCompany?: string
  contactPhone: string
  contactEmail: string
  contactCity?: string
  quantity: number
  message?: string
}

/** Suivi public d'une demande d'offre, par sa référence. */
export interface PurchaseTracking {
  reference: string
  listingId: string
  listingTitle: string
  status: PurchaseStage
  offerAmount: number | null
  quantity: number
  createdAt: string
  updatedAt: string
}
