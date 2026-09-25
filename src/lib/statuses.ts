import type {
  AnomalyStatus,
  EquipmentStatus,
  ListingCondition,
  ListingStatus,
  OpportunityStage,
  PurchaseStage,
  RentalStatus,
} from '../store/types'

/**
 * Libellés et couleurs des statuts, tous ensemble.
 *
 * Chaque écran redéfinissait les siens : « En attente » ambre ici, jaune là,
 * et une réservation « QUALIFIED » — statut arrivé avec le serveur — faisait
 * planter la page fournisseur qui ne connaissait que trois valeurs. Un
 * dictionnaire par cycle de vie, lu partout ; un statut inconnu s'affiche brut
 * plutôt que de casser l'écran.
 *
 * Ce fichier ne dépend de rien : le magasin peut le lire pour formuler une
 * notification sans créer de cycle avec les composants.
 */
export interface StatusStyle {
  label: string
  /** Classes de fond et de texte de la pastille. */
  className: string
  /** Vrai pour les statuts qui closent le parcours. */
  terminal?: boolean
}

export const STATUS_LABELS: Record<EquipmentStatus, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumis',
  PENDING_INSPECTION: 'À vérifier',
  INSPECTION_IN_PROGRESS: 'Vérification en cours',
  REPORT_SUBMITTED: 'Rapport transmis',
  PENDING_ADMIN_REVIEW: 'En attente de décision',
  REJECTED: 'Refusé',
  CORRECTIONS_REQUESTED: 'Corrections demandées',
  REFERENCED: 'Référencé',
  PUBLISHED: 'Publié',
  UNPUBLISHED: 'Dépublié',
}

export const STATUS_COLORS: Record<EquipmentStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  PENDING_INSPECTION: 'bg-amber-100 text-amber-700',
  INSPECTION_IN_PROGRESS: 'bg-orange-100 text-orange-700',
  REPORT_SUBMITTED: 'bg-indigo-100 text-indigo-700',
  PENDING_ADMIN_REVIEW: 'bg-purple-100 text-purple-700',
  REJECTED: 'bg-red-100 text-red-700',
  CORRECTIONS_REQUESTED: 'bg-yellow-100 text-yellow-800',
  REFERENCED: 'bg-cyan-100 text-cyan-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  UNPUBLISHED: 'bg-slate-200 text-slate-600',
}

/** Parcours d'une réservation, dans l'ordre du serveur. */
export const RENTAL_STATUS: Record<RentalStatus, StatusStyle> = {
  PENDING: { label: 'Nouvelle', className: 'bg-amber-100 text-amber-800' },
  QUALIFIED: { label: 'Qualifiée', className: 'bg-acier-100 text-acier-800' },
  ACCEPTED: { label: 'Acceptée par le fournisseur', className: 'bg-blue-100 text-blue-800' },
  CONFIRMED: { label: 'Confirmée', className: 'bg-indigo-100 text-indigo-800' },
  IN_PROGRESS: { label: 'En cours', className: 'bg-emerald-100 text-emerald-800' },
  COMPLETED: { label: 'Terminée', className: 'bg-slate-200 text-slate-700', terminal: true },
  DECLINED: { label: 'Refusée', className: 'bg-red-100 text-red-800', terminal: true },
  CANCELLED: { label: 'Annulée', className: 'bg-slate-100 text-slate-500', terminal: true },
}

export const RENTAL_ORDER: RentalStatus[] = [
  'PENDING', 'QUALIFIED', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED',
]

/** Pipeline commercial, dans l'ordre des colonnes. */
export const OPPORTUNITY_STAGE: Record<OpportunityStage, StatusStyle> = {
  NEW: { label: 'Nouvelle', className: 'bg-slate-100 text-slate-700' },
  CONTACTED: { label: 'Contactée', className: 'bg-acier-100 text-acier-800' },
  QUALIFIED: { label: 'Qualifiée', className: 'bg-blue-100 text-blue-800' },
  PROPOSAL: { label: 'Proposition', className: 'bg-indigo-100 text-indigo-800' },
  NEGOTIATION: { label: 'Conditions à préciser', className: 'bg-btp-100 text-btp-800' },
  WON: { label: 'Gagnée', className: 'bg-emerald-100 text-emerald-800', terminal: true },
  LOST: { label: 'Perdue', className: 'bg-red-100 text-red-800', terminal: true },
}

export const OPPORTUNITY_ORDER: OpportunityStage[] = [
  'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST',
]

/** Transitions autorisées par le serveur (OpportunityWorkflow). */
export const OPPORTUNITY_NEXT: Record<OpportunityStage, OpportunityStage[]> = {
  NEW: ['CONTACTED', 'QUALIFIED', 'LOST'],
  CONTACTED: ['QUALIFIED', 'LOST'],
  QUALIFIED: ['PROPOSAL', 'LOST'],
  PROPOSAL: ['NEGOTIATION', 'WON', 'LOST'],
  NEGOTIATION: ['PROPOSAL', 'WON', 'LOST'],
  WON: [],
  LOST: [],
}

export const ANOMALY_STATUS: Record<AnomalyStatus, StatusStyle> = {
  OPEN: { label: 'Ouverte', className: 'bg-red-100 text-red-800' },
  IN_PROGRESS: { label: 'En traitement', className: 'bg-amber-100 text-amber-800' },
  SUBMITTED: { label: 'Action soumise', className: 'bg-blue-100 text-blue-800' },
  UNDER_REVIEW: { label: 'En examen', className: 'bg-indigo-100 text-indigo-800' },
  RESOLVED: { label: 'Résolue', className: 'bg-emerald-100 text-emerald-800' },
  CLOSED: { label: 'Clôturée', className: 'bg-slate-200 text-slate-700', terminal: true },
}

/** Transitions autorisées par le serveur (AnomalyWorkflow), par rôle. */
export const ANOMALY_NEXT: Record<AnomalyStatus, AnomalyStatus[]> = {
  OPEN: ['IN_PROGRESS', 'SUBMITTED'],
  IN_PROGRESS: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW', 'IN_PROGRESS'],
  UNDER_REVIEW: ['RESOLVED', 'IN_PROGRESS'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
}

export const ANOMALY_SUPPLIER_TARGETS: AnomalyStatus[] = ['IN_PROGRESS', 'SUBMITTED']

export const ANOMALY_SEVERITY: Record<string, StatusStyle> = {
  MINEURE: { label: 'Mineure', className: 'bg-slate-100 text-slate-700' },
  MAJEURE: { label: 'Majeure', className: 'bg-btp-100 text-btp-800' },
  CRITIQUE: { label: 'Critique', className: 'bg-red-100 text-red-800' },
}

/* ------------------------------------------------------------------ */
/* Volta Market                                                        */
/* ------------------------------------------------------------------ */

export const LISTING_STATUS: Record<ListingStatus, StatusStyle> = {
  DRAFT: { label: 'Brouillon', className: 'bg-slate-100 text-slate-700' },
  SUBMITTED: { label: 'À examiner', className: 'bg-blue-100 text-blue-800' },
  PUBLISHED: { label: 'En ligne', className: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'À corriger', className: 'bg-red-100 text-red-800' },
  WITHDRAWN: { label: 'Retirée', className: 'bg-slate-200 text-slate-600' },
  SOLD: { label: 'Vendue', className: 'bg-acier-900 text-btp-300', terminal: true },
}

/** Circuit d'une demande d'offre (CDC §8), dans l'ordre du serveur. */
export const PURCHASE_FLOW: PurchaseStage[] = [
  'RECEIVED',
  'QUALIFYING',
  'AVAILABILITY_CHECK',
  'COMMERCIAL_REVIEW',
  'OFFER',
  'NEGOTIATION',
  'VALIDATED',
  'SOLD',
  'DELIVERED',
  'CLOSED',
]

export const PURCHASE_STAGE: Record<PurchaseStage, StatusStyle> = {
  // Volta Market est un achat, pas un marchandage : l'acheteur commande au
  // prix affiché et VOLTA confirme. Les étapes restent celles du serveur ;
  // seuls les mots vus par l'acheteur changent.
  RECEIVED: { label: 'Commande reçue', className: 'bg-slate-100 text-slate-700' },
  QUALIFYING: { label: 'Qualification', className: 'bg-acier-100 text-acier-800' },
  AVAILABILITY_CHECK: { label: 'Vérification disponibilité', className: 'bg-blue-100 text-blue-800' },
  COMMERCIAL_REVIEW: { label: 'Analyse commerciale', className: 'bg-indigo-100 text-indigo-800' },
  OFFER: { label: 'Commande confirmée', className: 'bg-btp-100 text-btp-800' },
  NEGOTIATION: { label: 'Conditions à préciser', className: 'bg-btp-100 text-btp-800' },
  VALIDATED: { label: 'Validée', className: 'bg-emerald-100 text-emerald-800' },
  SOLD: { label: 'Vente conclue', className: 'bg-emerald-100 text-emerald-800' },
  DELIVERED: { label: 'Livrée', className: 'bg-emerald-100 text-emerald-800' },
  CLOSED: { label: 'Clôturée', className: 'bg-slate-200 text-slate-600', terminal: true },
}

export const LISTING_CONDITION: Record<ListingCondition, string> = {
  NEUF: 'Neuf',
  OCCASION: 'Occasion',
}
