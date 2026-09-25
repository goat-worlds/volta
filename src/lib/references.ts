/**
 * Références lisibles.
 *
 * Les identifiants techniques sont des UUID ou des clés de seed (« u-tech-1 ») :
 * illisibles au téléphone et impossibles à dicter. Chaque objet que le client ou
 * le fournisseur doit citer reçoit donc une référence courte, stable et dérivée
 * de son identifiant — aucun compteur à stocker, aucune collision à arbitrer.
 *
 * Le préfixe dit qui porte l'objet, et c'est une information de service :
 * « VOL- » pour ce qui vit sur la plateforme et que l'utilisateur voit,
 * « GS- » pour ce que Génie Sélect produit, contrôle ou organise. Un client qui
 * appelle en citant « GS-INSP-00031 » a lu un rapport d'inspection, pas une
 * annonce — l'interlocuteur le sait avant même d'ouvrir le dossier.
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

/** Familles de références du cahier des charges (§29). */
const PREFIXES = {
  company: 'GS-ENT',
  equipment: 'VOL-ENG',
  request: 'VOL-REQ',
  market: 'VOL-MKT',
  mission: 'GS-MIS',
  technician: 'GS-TEC',
  inspection: 'GS-INSP',
  support: 'GS-ACC',
  match: 'GS-MATCH',
  // Le devis n'est pas listé au §29. Il est émis par Génie Sélect au terme de
  // la qualification, pas déposé par un fournisseur : il prend donc le préfixe
  // de l'opérateur, comme la mission et l'inspection qui l'entourent.
  quote: 'GS-DEV',
} as const

export type ReferenceKind = keyof typeof PREFIXES

/**
 * Référence lisible d'un objet — « VOL-ENG-00182 ».
 *
 * Cinq chiffres : assez pour que deux dossiers d'une même famille ne se
 * confondent pas à l'oral, assez court pour tenir dans une colonne de tableau.
 */
export function reference(kind: ReferenceKind, id: string): string {
  return `${PREFIXES[kind]}-${digits(id, 5)}`
}

/** Demande adressée à VOLTA : « VOL-REQ-00491 ». */
export function requestRef(id: string): string {
  return reference('request', id)
}

/** Demande d'achat sur Volta Market : « VOL-MKT-00124 ». */
export function marketRef(id: string): string {
  return reference('market', id)
}

/** Dossier d'engin : « VOL-ENG-00182 ». */
export function equipmentRef(id: string): string {
  return reference('equipment', id)
}

/** Fiche entreprise : « GS-ENT-00052 ». */
export function companyRef(id: string): string {
  return reference('company', id)
}

/** Candidature ou technicien du vivier : « GS-TEC-00074 ». */
export function technicianRef(id: string): string {
  return reference('technician', id)
}

/** Mission d'inspection : « GS-INSP-00031 ». */
export function inspectionRef(id: string): string {
  return reference('inspection', id)
}

/** Mission technique : « GS-MIS-00217 ». */
export function missionRef(id: string): string {
  return reference('mission', id)
}

/** Dossier d'accompagnement commercial : « GS-ACC-00018 ». */
export function supportRef(id: string): string {
  return reference('support', id)
}

/** Mise en relation : « GS-MATCH-00027 ». */
export function matchRef(id: string): string {
  return reference('match', id)
}

/**
 * Devis émis : « GS-DEV-00417 ».
 *
 * Les écrans client passent encore une date, héritée du format « DEV-2026-0417 ».
 * Le millésime ne distinguait rien que l'empreinte ne distingue déjà : il sort
 * de la référence, mais le paramètre reste accepté pour ne pas casser les
 * appels existants.
 */
export function quoteRef(id: string, createdAt?: string): string {
  void createdAt
  return reference('quote', id)
}

/** Ancienne signature des demandes de devis, alignée sur « VOL-REQ ». */
export function quoteRequestRef(id: string, createdAt?: string): string {
  void createdAt
  return requestRef(id)
}
