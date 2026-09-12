/**
 * Demandes adressées à Génie Sélect.
 *
 * Tous les parcours publics — louer, acheter, chercher un technicien, proposer
 * un engin, candidater GOLD, demander un accompagnement — aboutissent ici. Le
 * client ne contacte jamais le détenteur du matériel directement (§8) : il
 * dépose une demande, et l'opérateur qualifie.
 *
 * Les fonctions sont asynchrones bien que le stockage soit local : c'est la
 * signature qu'aura l'appel HTTP, et les écrans écrits contre elle n'auront pas
 * à être repris le jour de la bascule.
 */
import {
  REQUEST_FLOW,
  type IntentId,
  type Contact,
  type Priority,
  type Request,
  type RequestKind,
  type RequestStatus,
} from '../types/domain'
import { requestRef } from '../lib/references'
import { record } from './audit'
import { newId, prepend, readCollection, replaceRow } from './storage'

const COLLECTION = 'requests'

export interface NewRequest {
  kind: RequestKind
  intent: IntentId
  subject: string
  contact: Contact
  location: string
  priority?: Priority
  payload: Record<string, unknown>
}

export async function createRequest(input: NewRequest): Promise<Request> {
  const id = newId()
  const now = new Date().toISOString()

  const request: Request = {
    id,
    reference: requestRef(id),
    kind: input.kind,
    intent: input.intent,
    subject: input.subject,
    contact: input.contact,
    location: input.location,
    // Toute demande entre par le même point : « reçue ». Laisser un formulaire
    // choisir son statut d'arrivée ouvrirait la porte à des demandes qui se
    // déclarent qualifiées sans que personne les ait lues.
    status: 'RECEIVED',
    priority: input.priority ?? 'NORMAL',
    ownerId: null,
    payload: input.payload,
    createdAt: now,
    updatedAt: now,
  }

  prepend(COLLECTION, request)
  record({
    actor: request.contact.name,
    targetRef: request.reference,
    action: 'CREATE',
    after: request.subject,
  })

  return request
}

export async function listRequests(): Promise<Request[]> {
  return readCollection<Request>(COLLECTION)
}

export async function getRequest(id: string): Promise<Request | undefined> {
  return readCollection<Request>(COLLECTION).find((r) => r.id === id)
}

/** Retrouve une demande par sa référence — c'est ce que le client a sous les yeux. */
export async function getRequestByRef(reference: string): Promise<Request | undefined> {
  const wanted = reference.trim().toUpperCase()
  return readCollection<Request>(COLLECTION).find((r) => r.reference === wanted)
}

/**
 * Transitions autorisées (§31).
 *
 * Le parcours est linéaire, mais deux écarts sont légitimes : revenir d'un cran
 * quand une qualification rouvre un point, et clôturer depuis n'importe où —
 * une demande abandonnée par le client ne doit pas être poussée jusqu'à
 * « mission » pour pouvoir être refermée.
 */
export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  if (to === 'CLOSED') return true
  const current = REQUEST_FLOW.indexOf(from)
  const next = REQUEST_FLOW.indexOf(to)
  return next === current + 1 || next === current - 1
}

export async function advanceRequest(
  id: string,
  to: RequestStatus,
  actor: string,
): Promise<Request> {
  const request = await getRequest(id)
  if (!request) throw new Error(`Demande introuvable : ${id}`)
  if (!canTransition(request.status, to)) {
    throw new Error(`Passage de « ${request.status} » à « ${to} » non autorisé`)
  }

  const updated: Request = { ...request, status: to, updatedAt: new Date().toISOString() }
  replaceRow(COLLECTION, updated)
  record({
    actor,
    targetRef: request.reference,
    action: 'STATUS_CHANGE',
    field: 'statut',
    before: request.status,
    after: to,
  })

  return updated
}

export async function assignRequest(id: string, ownerId: string, actor: string): Promise<Request> {
  const request = await getRequest(id)
  if (!request) throw new Error(`Demande introuvable : ${id}`)

  const updated: Request = { ...request, ownerId, updatedAt: new Date().toISOString() }
  replaceRow(COLLECTION, updated)
  record({
    actor,
    targetRef: request.reference,
    action: 'ASSIGN',
    field: 'responsable',
    before: request.ownerId ?? '—',
    after: ownerId,
  })

  return updated
}

export async function setPriority(id: string, priority: Priority, actor: string): Promise<Request> {
  const request = await getRequest(id)
  if (!request) throw new Error(`Demande introuvable : ${id}`)

  const updated: Request = { ...request, priority, updatedAt: new Date().toISOString() }
  replaceRow(COLLECTION, updated)
  record({
    actor,
    targetRef: request.reference,
    action: 'UPDATE',
    field: 'priorité',
    before: request.priority,
    after: priority,
  })

  return updated
}
