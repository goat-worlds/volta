/**
 * Journal d'audit (CDC §28).
 *
 * La règle du cahier des charges est qu'aucune information ne peut être
 * présentée comme vérifiée, disponible ou validée sans trace correspondante.
 * Le journal est cette trace : il est écrit par les services, jamais par les
 * écrans, pour qu'aucun chemin de code ne puisse changer un statut sans le dire.
 */
import type { AuditAction, AuditEntry } from '../types/domain'
import { newId, prepend, readCollection } from './storage'

const COLLECTION = 'audit'

export interface AuditInput {
  actor: string
  targetRef: string
  action: AuditAction
  field?: string
  before?: string
  after?: string
}

export function record(input: AuditInput): AuditEntry {
  return prepend<AuditEntry>(COLLECTION, {
    id: newId(),
    at: new Date().toISOString(),
    ...input,
  })
}

/** Journal complet, du plus récent au plus ancien. */
export function listAudit(): AuditEntry[] {
  return readCollection<AuditEntry>(COLLECTION)
}

/** Historique d'un objet précis — l'onglet « Historique » d'une fiche. */
export function auditFor(targetRef: string): AuditEntry[] {
  return listAudit().filter((entry) => entry.targetRef === targetRef)
}
