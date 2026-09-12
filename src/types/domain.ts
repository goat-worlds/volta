/**
 * Modèle métier VOLTA × GÉNIE SÉLECT.
 *
 * Le fichier `store/types.ts` décrit ce que le backend Java sait aujourd'hui
 * manipuler : engins, inspections, devis, comptes. Il reste la vérité pour ces
 * objets-là. Ce fichier-ci décrit le métier tel que le cahier des charges le
 * définit — demandes, market, entreprises, GOLD, vivier technique, missions,
 * mises en relation, journal — dont l'essentiel n'a pas encore d'API.
 *
 * Les deux cohabitent volontairement : réécrire d'un bloc les écrans branchés
 * sur le serveur les casserait tous en même temps. Les modules nouveaux se
 * construisent sur ce modèle, les anciens y migreront lot par lot.
 *
 * Principe qui gouverne tout le fichier : rien n'est « vérifié », « conforme »
 * ou « disponible » par simple déclaration. Une affirmation du fournisseur et
 * un contrôle de Génie Sélect ne sont jamais le même champ.
 */

/* ------------------------------------------------------------------ */
/* Intentions                                                          */
/* ------------------------------------------------------------------ */

/**
 * Ce que l'utilisateur vient faire.
 *
 * C'est la seule chose qu'on lui demande. Le rôle, l'espace et le circuit de
 * traitement s'en déduisent — il n'a pas à connaître l'organisation interne.
 */
export type IntentId =
  | 'RENT_EQUIPMENT'
  | 'BUY_EQUIPMENT'
  | 'FIND_TECHNICIAN'
  | 'OFFER_EQUIPMENT'
  | 'LIST_CATALOG'
  | 'BECOME_GOLD'
  | 'GROW_SALES'
  | 'JOIN_TECHNICAL_TEAM'

/** À qui l'intention s'adresse — sert au regroupement, jamais à filtrer l'accès. */
export type Audience = 'CLIENT' | 'OWNER' | 'COMPANY' | 'TECHNICIAN'

/* ------------------------------------------------------------------ */
/* Demandes                                                            */
/* ------------------------------------------------------------------ */

/** Nature d'une demande entrante, déduite de l'intention qui l'a créée. */
export type RequestKind =
  | 'RENTAL'
  | 'PURCHASE'
  | 'TECHNICIAN'
  | 'EQUIPMENT_OFFER'
  | 'SUPPORT'
  | 'GOLD'

/**
 * Cycle de vie d'une demande (CDC §5).
 *
 * L'ordre du tableau est l'ordre du parcours : c'est lui qui alimente la frise
 * de suivi et qui interdit les sauts d'étape arbitraires (§31).
 */
export const REQUEST_FLOW = [
  'RECEIVED',
  'QUALIFYING',
  'SEARCHING',
  'QUOTE_DRAFT',
  'QUOTE_SENT',
  'VALIDATED',
  'MATCHED',
  'MISSION',
  'DONE',
  'CLOSED',
] as const

export type RequestStatus = (typeof REQUEST_FLOW)[number]

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  RECEIVED: 'Reçue',
  QUALIFYING: 'En qualification',
  SEARCHING: 'Recherche',
  QUOTE_DRAFT: 'Devis en préparation',
  QUOTE_SENT: 'Devis envoyé',
  VALIDATED: 'Validée',
  MATCHED: 'Mise en relation',
  MISSION: 'Mission',
  DONE: 'Terminée',
  CLOSED: 'Clôturée',
}

/** Priorité de traitement (CDC §26). */
export type Priority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'

export const PRIORITY_LABELS: Record<Priority, string> = {
  URGENT: 'Urgente',
  HIGH: 'Haute',
  NORMAL: 'Normale',
  LOW: 'Faible',
}

/** Coordonnées du demandeur — communes à tous les parcours. */
export interface Contact {
  name: string
  company?: string
  phone: string
  email: string
  city: string
}

/**
 * Demande adressée à Génie Sélect.
 *
 * `payload` porte les réponses propres au parcours emprunté : un besoin de
 * location et une candidature GOLD ne remplissent pas les mêmes champs, et les
 * aplatir ici obligerait à rendre optionnel presque tout le modèle.
 */
export interface Request {
  id: string
  reference: string
  kind: RequestKind
  intent: IntentId
  subject: string
  contact: Contact
  location: string
  status: RequestStatus
  priority: Priority
  /** Administrateur Génie Sélect qui en a la charge, s'il est désigné. */
  ownerId: string | null
  payload: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

/* ------------------------------------------------------------------ */
/* Équipements — déclaré / vérifié                                     */
/* ------------------------------------------------------------------ */

/**
 * Cycle de vie d'une fiche équipement (CDC §9 et §31).
 *
 * Un engin déclaré non conforme sort du circuit par `SUSPENDED` : il ne doit
 * plus être présenté comme disponible, sans pour autant être effacé.
 */
export const EQUIPMENT_FLOW = [
  'DRAFT',
  'SUBMITTED',
  'TO_VERIFY',
  'VERIFIED',
  'APPROVED',
  'PUBLISHED',
] as const

export type EquipmentLifecycle = (typeof EQUIPMENT_FLOW)[number] | 'SUSPENDED' | 'ARCHIVED'

export const EQUIPMENT_LIFECYCLE_LABELS: Record<EquipmentLifecycle, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumis',
  TO_VERIFY: 'À vérifier',
  VERIFIED: 'Vérifié',
  APPROVED: 'Validé',
  PUBLISHED: 'Publié',
  SUSPENDED: 'Suspendu',
  ARCHIVED: 'Archivé',
}

/** Disponibilité annoncée par le détenteur (CDC §9). */
export type AvailabilityKind = 'IMMEDIATE' | 'FROM_DATE' | 'ON_LEAD_TIME' | 'UNAVAILABLE'

export const AVAILABILITY_LABELS: Record<AvailabilityKind, string> = {
  IMMEDIATE: 'Immédiatement',
  FROM_DATE: 'À partir d’une date',
  ON_LEAD_TIME: 'Sous délai',
  UNAVAILABLE: 'Indisponible',
}

/**
 * Délai de dépannage (CDC §22).
 *
 * Deux valeurs coexistent toujours : celle qu'annonce le fournisseur et celle
 * qu'estime Génie Sélect. N'afficher qu'un chiffre reviendrait à transformer
 * une annonce commerciale en engagement.
 */
export type LeadTime = 'UNDER_24H' | 'H24_48' | 'H48_72' | 'OVER_72H' | 'TO_CONFIRM'

export const LEAD_TIME_LABELS: Record<LeadTime, string> = {
  UNDER_24H: 'Moins de 24 h',
  H24_48: '24–48 h',
  H48_72: '48–72 h',
  OVER_72H: 'Plus de 72 h',
  TO_CONFIRM: 'À confirmer',
}

/**
 * Preuve d'un contrôle.
 *
 * Un badge « Vérifié », « Documents vérifiés » ou « Dédouanement vérifié » ne
 * s'affiche que si une attestation de ce type existe et pointe vers l'objet qui
 * l'a produite. Sans `by` ni `at`, il n'y a pas d'attestation : il y a une
 * déclaration, et elle s'affiche comme telle.
 */
export interface Attestation {
  kind: 'INSPECTION' | 'DOCUMENTS' | 'CUSTOMS' | 'AVAILABILITY'
  /** Référence de l'inspection ou du contrôle qui fonde l'attestation. */
  sourceRef: string
  by: string
  at: string
  /** Une attestation périmée cesse de valoir preuve. */
  expiresAt?: string
}

/**
 * Ce que le détenteur affirme. Aucun de ces champs ne produit de badge.
 */
export interface DeclaredFacts {
  condition: string
  hours: number | null
  availability: AvailabilityKind
  availableFrom?: string
  customsCleared: boolean
  documentsProvided: string[]
  repairLeadTime: LeadTime
}

/**
 * Ce que Génie Sélect a contrôlé. Seuls ces champs autorisent un badge.
 */
export interface VerifiedFacts {
  attestations: Attestation[]
  /** Délai réévalué par l'équipe, distinct de celui annoncé. */
  repairLeadTime: LeadTime | null
}

/* ------------------------------------------------------------------ */
/* Volta Market                                                        */
/* ------------------------------------------------------------------ */

/** Circuit d'une demande d'achat (CDC §8). */
export const MARKET_FLOW = [
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
] as const

export type MarketStatus = (typeof MARKET_FLOW)[number]

export const MARKET_STATUS_LABELS: Record<MarketStatus, string> = {
  RECEIVED: 'Demande reçue',
  QUALIFYING: 'Qualification',
  AVAILABILITY_CHECK: 'Vérification disponibilité',
  COMMERCIAL_REVIEW: 'Analyse commerciale',
  OFFER: 'Offre',
  NEGOTIATION: 'Négociation',
  VALIDATED: 'Validation',
  SOLD: 'Vente',
  DELIVERED: 'Livraison',
  CLOSED: 'Clôture',
}

/* ------------------------------------------------------------------ */
/* Entreprises et qualification GOLD                                   */
/* ------------------------------------------------------------------ */

/** Étapes de la qualification GOLD (CDC §11). */
export const GOLD_FLOW = [
  'APPLICATION',
  'DOCUMENT_REVIEW',
  'ASSESSMENT',
  'AUDIT',
  'RECOMMENDATIONS',
  'SUPPORT',
  'VALIDATED',
  'PROMOTED',
] as const

export type GoldStage = (typeof GOLD_FLOW)[number]

export const GOLD_STAGE_LABELS: Record<GoldStage, string> = {
  APPLICATION: 'Candidature',
  DOCUMENT_REVIEW: 'Analyse documentaire',
  ASSESSMENT: 'Évaluation',
  AUDIT: 'Audit',
  RECOMMENDATIONS: 'Recommandations',
  SUPPORT: 'Accompagnement',
  VALIDATED: 'Validation GOLD',
  PROMOTED: 'Référencement renforcé',
}

/** Une ligne de complétude du profil, telle qu'affichée en recommandation (§12). */
export interface ProfileGap {
  field: string
  label: string
  /** Poids dans le pourcentage de complétude. */
  weight: number
  filled: boolean
}

export interface Company {
  id: string
  reference: string
  legalName: string
  sector: string
  description: string
  city: string
  coverage: string[]
  services: string[]
  certifications: string[]
  references: string[]
  documents: string[]
  contact: Contact
  goldStage: GoldStage | null
  createdAt: string
}

/* ------------------------------------------------------------------ */
/* Vivier technique                                                    */
/* ------------------------------------------------------------------ */

/** Traitement d'une candidature (CDC §16). */
export type CandidateStatus =
  | 'TO_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'VALIDATED'
  | 'ONBOARDED'
  | 'REJECTED'
  | 'ON_HOLD'

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  TO_REVIEW: 'À étudier',
  SHORTLISTED: 'Présélectionné',
  INTERVIEW: 'En audition',
  VALIDATED: 'Validé',
  ONBOARDED: 'Intégré',
  REJECTED: 'Rejeté',
  ON_HOLD: 'En attente',
}

/** Disponibilité d'un technicien intégré (CDC §18). */
export type TechnicianAvailability = 'AVAILABLE' | 'SOON' | 'ON_MISSION' | 'UNAVAILABLE'

export const TECHNICIAN_AVAILABILITY_LABELS: Record<TechnicianAvailability, string> = {
  AVAILABLE: 'Disponible',
  SOON: 'Disponible prochainement',
  ON_MISSION: 'En mission',
  UNAVAILABLE: 'Indisponible',
}

export interface Interview {
  date: string
  assessor: string
  score: number
  comment: string
  outcome: 'PASSED' | 'FAILED' | 'PENDING'
}

export interface Candidate {
  id: string
  reference: string
  contact: Contact
  trade: string
  specialty: string
  yearsOfExperience: number
  mobility: string[]
  skills: string[]
  certifications: string[]
  documents: string[]
  status: CandidateStatus
  availability: TechnicianAvailability | null
  interviews: Interview[]
  internalNotes: string[]
  createdAt: string
}

/* ------------------------------------------------------------------ */
/* Inspection technique                                                */
/* ------------------------------------------------------------------ */

/** Résultat d'un point de contrôle (CDC §20). */
export type CheckOutcome = 'CONFORME' | 'NON_CONFORME' | 'A_VERIFIER' | 'NON_APPLICABLE'

export const CHECK_OUTCOME_LABELS: Record<CheckOutcome, string> = {
  CONFORME: 'Conforme',
  NON_CONFORME: 'Non conforme',
  A_VERIFIER: 'À vérifier',
  NON_APPLICABLE: 'Non applicable',
}

/** Réponse à la question de mobilité immédiate (CDC §20). */
export type MobilityAnswer = 'YES' | 'NO' | 'CONDITIONAL'

export const MOBILITY_LABELS: Record<MobilityAnswer, string> = {
  YES: 'Oui',
  NO: 'Non',
  CONDITIONAL: 'Sous conditions',
}

/** État du dédouanement constaté (CDC §20). */
export type CustomsStatus =
  | 'CLEARED'
  | 'PROOF_AVAILABLE'
  | 'PROOF_MISSING'
  | 'TO_REGULARISE'
  | 'NOT_APPLICABLE'

export const CUSTOMS_LABELS: Record<CustomsStatus, string> = {
  CLEARED: 'Dédouané',
  PROOF_AVAILABLE: 'Justificatif disponible',
  PROOF_MISSING: 'Justificatif manquant',
  TO_REGULARISE: 'À régulariser',
  NOT_APPLICABLE: 'Non applicable',
}

export interface CheckPoint {
  section: string
  label: string
  outcome: CheckOutcome | null
  observation: string
  photos: string[]
}

/* ------------------------------------------------------------------ */
/* Missions et mises en relation                                       */
/* ------------------------------------------------------------------ */

export type MissionStatus = 'PLANNED' | 'IN_PROGRESS' | 'REPORTED' | 'CLOSED'

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  PLANNED: 'Planifiée',
  IN_PROGRESS: 'En cours',
  REPORTED: 'Rapport remis',
  CLOSED: 'Clôturée',
}

/**
 * Mise en relation (CDC §27).
 *
 * C'est un acte administratif tracé, pas un lien automatique : Génie Sélect
 * choisit, engage sa recommandation, et l'historique dit qui a proposé quoi.
 */
export interface Match {
  id: string
  reference: string
  requestId: string
  companyId: string | null
  equipmentId: string | null
  technicianId: string | null
  proposedBy: string
  proposedAt: string
  status: 'PROPOSED' | 'ACCEPTED' | 'DECLINED' | 'CLOSED'
  outcome: string | null
}

/* ------------------------------------------------------------------ */
/* Journal d'audit                                                     */
/* ------------------------------------------------------------------ */

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'VALIDATE'
  | 'REJECT'
  | 'PUBLISH'
  | 'SUSPEND'
  | 'STATUS_CHANGE'
  | 'DOCUMENT_ADD'
  | 'DELETE'
  | 'ASSIGN'
  | 'MATCH'

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  VALIDATE: 'Validation',
  REJECT: 'Rejet',
  PUBLISH: 'Publication',
  SUSPEND: 'Suspension',
  STATUS_CHANGE: 'Changement de statut',
  DOCUMENT_ADD: 'Ajout de document',
  DELETE: 'Suppression',
  ASSIGN: 'Attribution',
  MATCH: 'Mise en relation',
}

/**
 * Entrée du journal (CDC §28).
 *
 * `before` et `after` gardent la valeur remplacée : sans elle, une ligne
 * « disponibilité modifiée » n'apprend rien à qui la relit six mois plus tard.
 */
export interface AuditEntry {
  id: string
  at: string
  actor: string
  /** Référence lisible de l'objet touché — « VOL-ENG-00182 ». */
  targetRef: string
  action: AuditAction
  field?: string
  before?: string
  after?: string
}
