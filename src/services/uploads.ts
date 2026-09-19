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

  const token = getToken()
  const form = new FormData()
  form.append('file', file)

  let res: Response
  try {
    res = await fetch(`${BASE}/equipment/photos`, {
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
    throw new ApiError(res.status, message ?? describeStatus(res.status), 'POST', '/equipment/photos')
  }

  return (await res.json()) as UploadedPhoto
}
