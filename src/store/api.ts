const BASE = import.meta.env.VITE_API_URL ?? '/api'

const TOKEN_KEY = 'volta_session_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

/**
 * Erreurs de l'API.
 *
 * Une réponse refusée était levée comme une chaîne « API POST /x failed: 403 »,
 * que chaque écran affichait telle quelle ou remplaçait par un texte de son cru.
 * L'utilisateur lisait un code HTTP, jamais la raison — alors que le serveur
 * l'écrit dans le corps de sa réponse (`message`).
 *
 * Deux natures d'échec, que l'interface doit distinguer :
 *   - le serveur a répondu et refuse (ApiError) : on affiche sa raison, et le
 *     statut décide de la suite — 401 ferme la session, 403 dit « pas le
 *     droit », 409 dit « plus possible dans cet état » ;
 *   - le serveur n'a pas répondu (ApiUnavailableError) : rien n'est perdu côté
 *     client, il faut le dire et proposer de réessayer.
 */
export class ApiError extends Error {
  readonly status: number
  readonly path: string
  readonly method: string

  constructor(status: number, message: string, method: string, path: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.method = method
    this.path = path
  }
}

export class ApiUnavailableError extends Error {
  constructor() {
    super('VOLTA n’arrive pas à joindre le serveur.')
    this.name = 'ApiUnavailableError'
  }
}

/** Libellé par défaut d'un statut, quand le serveur n'en donne pas. */
const DEFAULT_MESSAGE: Record<number, string> = {
  400: 'La demande est incomplète ou mal formée.',
  401: 'Votre session a expiré, veuillez vous reconnecter.',
  403: 'Vous n’avez pas les permissions nécessaires pour effectuer cette opération.',
  404: 'L’élément demandé n’existe pas ou plus.',
  409: 'Cette action n’est plus possible dans l’état actuel de l’élément.',
  500: 'Une erreur est survenue côté serveur.',
}

export function describeStatus(status: number): string {
  return DEFAULT_MESSAGE[status] ?? `Le serveur a répondu avec le code ${status}.`
}

/**
 * Événements de connexion, écoutés par le magasin.
 *
 * La couche HTTP ne connaît ni React ni le magasin ; elle signale, et le
 * magasin décide : fermer la session sur 401, lever le drapeau de panne quand
 * le réseau ne répond pas, le baisser dès qu'une réponse revient.
 */
export const API_EVENTS = {
  unauthorized: 'volta:api:unauthorized',
  unavailable: 'volta:api:unavailable',
  reachable: 'volta:api:reachable',
} as const

function emit(name: string) {
  window.dispatchEvent(new Event(name))
}

/** Le corps d'une réponse refusée : le message du serveur, et s'il était bien en JSON. */
async function readErrorBody(res: Response): Promise<{ message: string | null; json: boolean }> {
  try {
    const text = await res.text()
    if (!text) return { message: null, json: false }
    const body = JSON.parse(text) as { message?: unknown }
    return {
      message: typeof body.message === 'string' && body.message.trim() ? body.message : null,
      json: true,
    }
  } catch {
    return { message: null, json: false }
  }
}

/**
 * Le serveur est-il réellement injoignable ?
 *
 * Un serveur arrêté ne fait pas toujours échouer `fetch` : le proxy placé
 * devant lui — Vite en développement, l'hébergeur en production — répond à
 * sa place, en 502/503/504, ou en 500 avec un texte brut. L'API, elle,
 * répond toujours en JSON, même pour se plaindre. Un 500 sans JSON est donc
 * la signature d'un intermédiaire qui parle pour un serveur absent.
 */
function looksUnavailable(status: number, json: boolean): boolean {
  return status === 502 || status === 503 || status === 504 || (status === 500 && !json)
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const method = options?.method ?? 'GET'
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Session-Token': token } : {}),
      },
      ...options,
    })
  } catch {
    // fetch ne rejette que si la requête n'est jamais partie ou n'a jamais
    // reçu de réponse : serveur arrêté, DNS, coupure réseau. Une réponse 500
    // n'arrive pas ici.
    emit(API_EVENTS.unavailable)
    throw new ApiUnavailableError()
  }
  if (!res.ok) {
    const body = await readErrorBody(res)
    if (looksUnavailable(res.status, body.json)) {
      emit(API_EVENTS.unavailable)
      throw new ApiUnavailableError()
    }
    emit(API_EVENTS.reachable)
    if (res.status === 401 && token) emit(API_EVENTS.unauthorized)
    throw new ApiError(res.status, body.message ?? describeStatus(res.status), method, path)
  }
  emit(API_EVENTS.reachable)
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const apiGet = <T>(path: string) => request<T>(path)

export const apiPost = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })

export const apiPut = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) })

export const apiDelete = <T>(path: string) => request<T>(path, { method: 'DELETE' })

/**
 * Téléchargement d'un fichier protégé par la session — une pièce jointe de
 * demande, par exemple.
 *
 * Un simple lien `<a href>` ne porterait pas l'en-tête de session : le
 * navigateur ne l'ajoute qu'aux requêtes que le code déclenche lui-même. La
 * réponse est donc récupérée ici en mémoire, puis remise à l'appelant comme un
 * `Blob` qu'il matérialise en lien de téléchargement le temps d'un clic.
 */
export async function apiDownload(path: string): Promise<{ blob: Blob; filename: string | null }> {
  const token = getToken()
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: token ? { 'X-Session-Token': token } : {},
    })
  } catch {
    emit(API_EVENTS.unavailable)
    throw new ApiUnavailableError()
  }
  if (!res.ok) {
    const body = await readErrorBody(res)
    emit(API_EVENTS.reachable)
    if (res.status === 401 && token) emit(API_EVENTS.unauthorized)
    throw new ApiError(res.status, body.message ?? describeStatus(res.status), 'GET', path)
  }
  emit(API_EVENTS.reachable)
  const disposition = res.headers.get('content-disposition') ?? ''
  const match = /filename="?([^"]+)"?/.exec(disposition)
  return { blob: await res.blob(), filename: match ? match[1] : null }
}

/**
 * Message à montrer pour une erreur quelconque.
 *
 * Les écrans faisaient chacun leur `err instanceof Error ? err.message : '…'`,
 * et l'on obtenait tantôt un code HTTP brut, tantôt une phrase. Un seul
 * endroit décide de la formulation.
 */
export function errorMessage(err: unknown, fallback = 'Une erreur est survenue.'): string {
  if (err instanceof ApiUnavailableError) return err.message
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message) return err.message
  return fallback
}
