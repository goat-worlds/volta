/**
 * Pièces jointes des parcours publics — le CV d'une candidature, d'abord.
 *
 * Le fichier est lu en mémoire au moment où l'utilisateur le choisit, décrit
 * par une petite fiche (nom, taille, type, identifiant) que le formulaire
 * porte dans sa valeur de champ, et transmis avec la demande à `createRequest`
 * (services/requests.ts) au moment de l'envoi — jamais avant, jamais séparément.
 *
 * Le contenu ne transite pas par le stockage du navigateur : il reste en
 * mémoire, sous son propre identifiant, le temps que l'utilisateur termine et
 * envoie son formulaire. Naviguer ailleurs ou recharger la page l'oublie —
 * c'est le même compromis qu'un `<input type="file">` ordinaire.
 */
import { newId } from './storage'

export interface AttachmentMeta {
  id: string
  name: string
  size: number
  type: string
}

/** Contenu retenu en mémoire le temps de l'envoi, par identifiant de fiche. */
const pending = new Map<string, { dataUrl: string; name: string; type: string }>()

/** Au-delà, la conversion en base64 alourdirait sensiblement la demande envoyée. */
export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024

export function saveAttachment(file: File): Promise<AttachmentMeta> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      reject(new Error('Le fichier dépasse 3 Mo. Compressez-le ou exportez-le en PDF plus léger.'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Le fichier n’a pas pu être lu.'))
    reader.onload = () => {
      const meta: AttachmentMeta = { id: newId(), name: file.name, size: file.size, type: file.type }
      pending.set(meta.id, { dataUrl: String(reader.result), name: file.name, type: file.type })
      resolve(meta)
    }
    reader.readAsDataURL(file)
  })
}

export function removeAttachment(id: string): void {
  pending.delete(id)
}

/**
 * Contenu prêt à être envoyé au serveur : le base64 seul, sans le préambule
 * `data:<type>;base64,` que le navigateur y accole.
 *
 * Renvoie `null` si le fichier n'est plus en mémoire — page rechargée entre le
 * choix du fichier et l'envoi, par exemple : le formulaire doit alors demander
 * de le resélectionner plutôt que d'envoyer une demande à laquelle il manque
 * sa pièce jointe sans le dire.
 */
export function attachmentPayload(id: string): { contentBase64: string; type: string } | null {
  const entry = pending.get(id)
  if (!entry) return null
  const comma = entry.dataUrl.indexOf(',')
  const contentBase64 = comma >= 0 ? entry.dataUrl.slice(comma + 1) : entry.dataUrl
  return { contentBase64, type: entry.type }
}

/** Les champs de formulaire transportent la description en JSON dans une chaîne. */
export function parseAttachment(value: string): AttachmentMeta | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Partial<AttachmentMeta>
    return parsed && typeof parsed.id === 'string' && typeof parsed.name === 'string'
      ? (parsed as AttachmentMeta)
      : null
  } catch {
    return null
  }
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}
