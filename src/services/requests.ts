/**
 * Demandes adressées à Génie Sélect.
 *
 * Tous les parcours publics — louer, acheter, chercher un technicien, proposer
 * un engin, candidater GOLD, demander un accompagnement, rejoindre l'équipe
 * technique — aboutissent ici, sur le serveur (`/api/public/requests`). Le
 * client ne contacte jamais le détenteur du matériel directement (§8) : il
 * dépose une demande, et l'opérateur qualifie depuis la console
 * d'administration (`/admin/demandes`).
 *
 * Le déposant n'a pas de compte : il ne revoit son dossier que par sa
 * référence et le secret de suivi reçus à l'instant du dépôt (`trackingCode`),
 * jamais autrement — les revoir suppose de les avoir notés.
 */
import { REQUEST_FLOW, type Contact, type IntentId, type Priority, type RequestKind, type RequestStatus } from '../types/domain'
import { apiDownload, apiGet, apiPost } from '../store/api'

export interface RequestAttachmentInput {
  field: string
  name: string
  type: string
  size: number
  contentBase64: string
}

export interface NewRequest {
  kind: RequestKind
  intent: IntentId
  subject: string
  contact: Contact
  location: string
  priority?: Priority
  payload: Record<string, string>
  attachments?: RequestAttachmentInput[]
}

/** Ce que le déposant garde : à défaut, il ne pourra plus jamais retrouver son dossier. */
export interface RequestReceipt {
  id: string
  reference: string
  trackingToken: string
  trackingCode: string
  status: RequestStatus
  createdAt: string
}

export function createRequest(input: NewRequest): Promise<RequestReceipt> {
  return apiPost<RequestReceipt>('/public/requests', {
    kind: input.kind,
    intent: input.intent,
    subject: input.subject,
    location: input.location,
    priority: input.priority ?? 'NORMAL',
    contact: input.contact,
    payload: input.payload,
    attachments: input.attachments ?? [],
  })
}

/** Ce que le suivi public montre : l'avancement, jamais les coordonnées ni les réponses saisies. */
export interface RequestTrackingInfo {
  reference: string
  subject: string
  location: string
  status: RequestStatus
  priority: Priority
  createdAt: string
  updatedAt: string
  /** Décide des mots du suivi : candidature ou demande de matériel. */
  intent?: string | null
  /** Rendez-vous fixé par VOLTA : c'est ce que le candidat vient lire. */
  meetingAt?: string | null
  meetingNote?: string | null
  /** Orientation décidée après les rencontres, une fois prononcée. */
  orientation?: Orientation | null
}

/** Suivi public : référence et secret remis au dépôt, l'avancement seulement. */
export function trackRequest(reference: string, token: string): Promise<RequestTrackingInfo> {
  const ref = encodeURIComponent(reference.trim().toUpperCase())
  return apiGet<RequestTrackingInfo>(`/public/requests/track/${ref}?token=${encodeURIComponent(token)}`)
}

// ------------------------------------------------------------------
// Console d'administration
// ------------------------------------------------------------------

/** Fiche complète d'une demande, telle que l'équipe VOLTA la voit et la traite. */
export interface AdminRequestView {
  id: string
  reference: string
  kind: RequestKind
  intent: IntentId
  subject: string
  contact: Contact
  location: string
  status: RequestStatus
  priority: Priority
  ownerId: string | null
  payload: Record<string, string>
  /** Historique horodaté des décisions de traitement, en texte libre. */
  notes: string
  createdAt: string
  updatedAt: string
  /** Rencontre fixée par VOLTA, publiée telle quelle dans le suivi du candidat. */
  meetingAt?: string | null
  meetingNote?: string | null
  /** Décision du responsable académie après les rencontres. */
  orientation?: Orientation | null
}

export interface AttachmentMeta {
  id: string
  fieldName: string
  originalName: string
  contentType: string
  size: number
}

export interface RequestDetail {
  request: AdminRequestView
  attachments: AttachmentMeta[]
}

/** Toutes les demandes, du plus récent au plus ancien — réservé à l'administration. */
export const listRequests = () => apiGet<AdminRequestView[]>('/admin/requests')

export const getRequestDetail = (id: string) => apiGet<RequestDetail>(`/admin/requests/${id}`)

/**
 * Transitions autorisées (§31), pour activer ou griser les actions à l'écran.
 * Le serveur applique la même règle et tranche en dernier ressort.
 */
export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  if (to === 'CLOSED') return true
  const current = REQUEST_FLOW.indexOf(from)
  const next = REQUEST_FLOW.indexOf(to)
  return next === current + 1 || next === current - 1
}

/**
 * Compte créé pour le candidat dont la candidature technique vient d'être
 * validée. Le mot de passe n'apparaît qu'ici, une seule fois : à transmettre
 * au candidat par un canal distinct, comme la clé d'un transfert chiffré.
 */
export interface ProvisionedAccount {
  email: string
  temporaryPassword: string
  role: string
}

export interface AdvanceResult {
  request: AdminRequestView
  account: ProvisionedAccount | null
}

/**
 * Ce que devient le candidat après les rencontres.
 *
 * Le recrutement ne produit pas qu'un seul profil : seul « technicien » ouvre
 * un compte d'équipe technique à la validation, les deux autres orientations
 * versent le candidat au réseau de consultants.
 */
export type Orientation = 'TECHNICIAN' | 'STAGE_CONSULTANT' | 'EXTERNAL_CONSULTANT'

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  TECHNICIAN: 'Équipe technique',
  STAGE_CONSULTANT: 'Consultant en stage',
  EXTERNAL_CONSULTANT: 'Consultant externe',
}

/**
 * VOLTA retient le dossier.
 *
 * Un seul geste pour la décision qui n'en est qu'une : « ce dossier est bon,
 * on le traite ». Le serveur enchaîne les mêmes transitions que le suivi pas
 * à pas, sans en sauter aucune.
 */
export const selectRequest = (id: string, note?: string) =>
  apiPost<AdvanceResult>(`/admin/requests/${id}/select`, { note })

/** Le responsable académie oriente ; une valeur vide efface la décision. */
export const setOrientation = (id: string, orientation: Orientation | '', note: string) =>
  apiPost<AdminRequestView>(`/admin/requests/${id}/orientation`, { orientation, note })

/** VOLTA fixe la rencontre ; une date vide l'annule. */
export const scheduleMeeting = (id: string, meetingAt: string, meetingNote: string) =>
  apiPost<AdminRequestView>(`/admin/requests/${id}/meeting`, { meetingAt, meetingNote })

export const advanceRequest = (id: string, status: RequestStatus, notes?: string) =>
  apiPost<AdvanceResult>(`/admin/requests/${id}/status`, { status, notes })

/** Télécharge une pièce jointe (protégée par la session admin) et déclenche son enregistrement. */
export async function downloadAttachment(requestId: string, attachmentId: string, fallbackName: string) {
  const { blob, filename } = await apiDownload(`/admin/requests/${requestId}/attachments/${attachmentId}`)
  const url = URL.createObjectURL(blob)
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = filename ?? fallbackName
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    URL.revokeObjectURL(url)
  }
}
