/**
 * Persistance locale des modules sans backend.
 *
 * Market, GOLD, vivier technique, missions, mises en relation et journal
 * n'ont aucune API : le serveur Java ne connaît que les engins, les devis, les
 * inspections et les comptes. Plutôt que d'écrire ces écrans sur des tableaux
 * en dur — où toute saisie disparaît au rechargement et où rien ne se teste —
 * chaque module passe par une collection nommée, stockée dans le navigateur.
 *
 * Le jour où l'endpoint existe, c'est l'adaptateur du service qui change ; les
 * pages, elles, appellent déjà des fonctions asynchrones et n'ont rien à savoir
 * de l'endroit où vivent les données.
 */

const PREFIX = 'volta_'

/** Une écriture refusée (navigation privée, quota) ne doit pas casser l'écran. */
function guard<T>(action: () => T, fallback: T): T {
  try {
    return action()
  } catch {
    return fallback
  }
}

export function readCollection<T>(name: string): T[] {
  return guard(() => {
    const raw = localStorage.getItem(PREFIX + name)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as T[]) : []
  }, [])
}

export function writeCollection<T>(name: string, rows: T[]): void {
  guard(() => localStorage.setItem(PREFIX + name, JSON.stringify(rows)), undefined)
}

/**
 * Ajoute une ligne en tête : les écrans d'administration lisent du plus récent
 * au plus ancien, et trier à chaque affichage coûterait sans rien apporter.
 */
export function prepend<T>(name: string, row: T): T {
  writeCollection(name, [row, ...readCollection<T>(name)])
  return row
}

export function replaceRow<T extends { id: string }>(name: string, row: T): T {
  writeCollection(
    name,
    readCollection<T>(name).map((existing) => (existing.id === row.id ? row : existing)),
  )
  return row
}

/**
 * Identifiant local.
 *
 * `crypto.randomUUID` n'existe pas hors contexte sécurisé — une démonstration
 * servie en HTTP sur une adresse locale y tombe. Le repli reste unique dans une
 * même session, ce qui suffit à des données qui ne quittent pas le poste.
 */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
