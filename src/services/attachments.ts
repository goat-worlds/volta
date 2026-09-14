/**
 * Pièces jointes des parcours publics — le CV d'une candidature, d'abord.
 *
 * Le serveur n'a pas encore de stockage de fichiers (lib/features, UPLOAD).
 * Le fichier est donc conservé sur l'appareil, à côté de la demande qu'il
 * accompagne, et la demande n'en porte que la description : nom, taille, type
 * et identifiant. Le jour où l'endpoint existe, `saveAttachment` l'appelle et
 * renvoie la même description — les formulaires n'ont rien à changer.
 *
 * Le contenu est rangé sous sa propre clé, pas dans la collection des demandes :
 * relire toutes les demandes ne doit pas décoder tous les fichiers.
 */
import { newId } from './storage'

export interface AttachmentMeta {
  id: string
  name: string
  size: number
  type: string
}

const PREFIX = 'volta_file_'

/** Au-delà, le stockage du navigateur refuse l'écriture : on le dit avant. */
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
      try {
        localStorage.setItem(PREFIX + meta.id, String(reader.result))
      } catch {
        reject(new Error('Le fichier n’a pas pu être conservé sur cet appareil (espace insuffisant).'))
        return
      }
      resolve(meta)
    }
    reader.readAsDataURL(file)
  })
}

export function readAttachment(id: string): string | null {
  try {
    return localStorage.getItem(PREFIX + id)
  } catch {
    return null
  }
}

export function removeAttachment(id: string): void {
  try {
    localStorage.removeItem(PREFIX + id)
  } catch {
    /* rien à faire : la clé n'existait pas ou l'accès est refusé */
  }
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
