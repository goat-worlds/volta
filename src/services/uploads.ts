/**
 * Envoi de photos d'engins vers EquipmentPhotoController (backend).
 *
 * apiPost (store/api.ts) sérialise toujours son corps en JSON, ce qui ne
 * convient pas à un fichier : celui-ci part en `multipart/form-data`, sans
 * l'en-tête `Content-Type` fixé à la main — le navigateur y ajoute la
 * frontière (« boundary ») que le serveur attend, une valeur que fetch seul
 * connaît au moment de l'envoi.
 *
 * Le fichier est stocké côté serveur sous un nom généré (UUID) dans un
 * dossier dédié ; seule l'URL renvoyée est conservée ici, et c'est elle que
 * l'écran ajoute à la liste `photos` de l'engin.
 */
import { ApiError, ApiUnavailableError, describeStatus, getToken } from '../store/api'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

export interface UploadedPhoto {
  url: string
}

/** Poids et formats acceptés par EquipmentPhotoController — vérifiés ici pour ne pas attendre la réponse du serveur. */
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Formats acceptés : JPEG, PNG, WebP.'
  if (file.size > MAX_PHOTO_BYTES) return 'La photo dépasse 8 Mo.'
  return null
}

export async function uploadEquipmentPhoto(file: File): Promise<UploadedPhoto> {
  const invalid = validatePhotoFile(file)
  if (invalid) throw new Error(invalid)
  return postFile('/equipment/photos', file)
}

/** Pièces d'inspection : clichés de terrain et papiers de douane (PDF accepté). */
export const MAX_INSPECTION_BYTES = 10 * 1024 * 1024
const INSPECTION_TYPES = [...ALLOWED_TYPES, 'application/pdf']

export function validateInspectionFile(file: File): string | null {
  if (!INSPECTION_TYPES.includes(file.type)) return 'Formats acceptés : JPEG, PNG, WebP ou PDF.'
  if (file.size > MAX_INSPECTION_BYTES) return 'Le fichier dépasse 10 Mo.'
  return null
}

export async function uploadInspectionFile(file: File): Promise<UploadedPhoto> {
  const invalid = validateInspectionFile(file)
  if (invalid) throw new Error(invalid)
  return postFile('/inspections/files', file)
}

async function postFile(path: string, file: File): Promise<UploadedPhoto> {
  const token = getToken()
  const form = new FormData()
  form.append('file', file)

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: token ? { 'X-Session-Token': token } : {},
      body: form,
    })
  } catch {
    throw new ApiUnavailableError()
  }

  if (!res.ok) {
    let message: string | null = null
    try {
      const body = await res.json()
      if (typeof body?.message === 'string') message = body.message
    } catch {
      // Réponse non JSON (ex. 413 renvoyé par un reverse proxy) : le statut
      // générique suffit, describeStatus() ci-dessous s'en charge.
    }
    throw new ApiError(res.status, message ?? describeStatus(res.status), 'POST', path)
  }

  return (await res.json()) as UploadedPhoto
}
