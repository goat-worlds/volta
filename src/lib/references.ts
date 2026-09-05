/**
 * Références lisibles.
 *
 * Les identifiants techniques sont des UUID ou des clés de seed (« u-tech-1 ») :
 * illisibles au téléphone et impossibles à dicter. Chaque objet que le client ou
 * le fournisseur doit citer reçoit donc une référence courte, stable et dérivée
 * de son identifiant — aucun compteur à stocker, aucune collision à arbitrer.
 */

/** Empreinte décimale stable d'un identifiant, sur `size` chiffres. */
function digits(id: string, size: number): string {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    // Somme pondérée classique : bornée à 32 bits, déterministe d'un poste à
    // l'autre — deux utilisateurs lisent la même référence pour un même objet.
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  const positive = Math.abs(hash) % 10 ** size
  return positive.toString().padStart(size, '0')
}

/** Année de l'objet, tirée de sa date de création quand elle est exploitable. */
function year(createdAt?: string): string {
  if (createdAt) {
    const parsed = new Date(createdAt)
    if (!Number.isNaN(parsed.getTime())) return String(parsed.getFullYear())
  }
  return String(new Date().getFullYear())
}

/** Demande de devis : « DEM-2026-0417 ». */
export function quoteRequestRef(id: string, createdAt?: string): string {
  return `DEM-${year(createdAt)}-${digits(id, 4)}`
}

/** Devis émis par un fournisseur : « DEV-2026-0417 ». */
export function quoteRef(id: string, createdAt?: string): string {
  return `DEV-${year(createdAt)}-${digits(id, 4)}`
}

/** Dossier d'engin suivi par le fournisseur : « ENG-4172 ». */
export function equipmentRef(id: string): string {
  return `ENG-${digits(id, 4)}`
}

/** Mission d'inspection : « INS-4172 ». */
export function inspectionRef(id: string): string {
  return `INS-${digits(id, 4)}`
}
