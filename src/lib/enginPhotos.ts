/**
 * Photothèque des engins.
 *
 * Les écrans tiraient leurs visuels d'Unsplash : une plateforme d'engins de
 * chantier ivoirienne affichait donc des photos d'un service externe, qui
 * disparaissent hors ligne et changent sans prévenir. Les fichiers du dossier
 * `public/engins` sont servis par l'application elle-même.
 *
 * Tant que l'envoi de fichiers n'est pas branché, le fournisseur choisit dans
 * cette photothèque — un choix explicite plutôt qu'une image tirée au sort.
 */

export interface EnginPhoto {
  src: string
  label: string
  /** Catégorie d'engin, pour proposer d'abord les visuels pertinents. */
  categoryId: string
}

export const ENGIN_PHOTOS: EnginPhoto[] = [
  { src: '/engins/pelle-cat-336e.jpeg', label: 'Pelle Caterpillar 336E', categoryId: 'c-pelle' },
  { src: '/engins/pelle-cat-6015b.jpeg', label: 'Pelle Caterpillar 6015B', categoryId: 'c-pelle' },
  { src: '/engins/pelle-komatsu.jpeg', label: 'Pelle Komatsu', categoryId: 'c-pelle' },
  { src: '/engins/grue-mobile.jpeg', label: 'Grue mobile', categoryId: 'c-grue' },
  { src: '/engins/compacteur-cat.jpeg', label: 'Compacteur Caterpillar', categoryId: 'c-compacteur' },
  { src: '/engins/camion-kamaz.jpeg', label: 'Camion benne Kamaz', categoryId: 'c-camion' },
  { src: '/engins/groupe-mobile.jpeg', label: 'Groupe mobile', categoryId: 'c-groupe' },
]

/** Image de repli quand un engin n'a pas encore de photo. */
export const PHOTO_FALLBACK = '/images/placeholders/equipment.svg'

/**
 * Photothèque réordonnée pour une catégorie : les visuels correspondants
 * d'abord, les autres ensuite — aucun n'est retiré, un loueur sait mieux que
 * nous à quoi ressemble sa machine.
 */
export function photosForCategory(categoryId: string): EnginPhoto[] {
  const matching = ENGIN_PHOTOS.filter((p) => p.categoryId === categoryId)
  const rest = ENGIN_PHOTOS.filter((p) => p.categoryId !== categoryId)
  return [...matching, ...rest]
}
