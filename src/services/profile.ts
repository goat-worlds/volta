/**
 * Ce que l'appareil retient de vous.
 *
 * Une personne qui a déjà déposé une demande revient — pour en déposer une
 * autre, pour suivre la première. Lui refaire taper son nom, son entreprise et
 * son téléphone à chaque fois lui dit que la maison ne la reconnaît pas. Or la
 * seule chose qui manque, c'est la mémoire : les coordonnées ont déjà été
 * saisies une fois.
 *
 * Elles restent sur l'appareil, jamais ailleurs. Rien n'est envoyé au serveur
 * par ce module : il ne fait que préremplir un formulaire que la personne
 * relit et corrige avant d'envoyer. C'est le même service qu'un carnet posé à
 * côté du téléphone, et il se vide d'un geste (`forgetVisitor`).
 */
import { readCollection, writeCollection } from './storage'

export interface VisitorProfile {
  name: string
  company: string
  phone: string
  email: string
  city: string
  /** Références déjà déposées depuis cet appareil, la plus récente en tête. */
  references: string[]
  updatedAt: string
}

const COLLECTION = 'visitor'

/**
 * Le profil est rangé dans une collection d'une seule ligne plutôt que sous
 * une clé à part : il profite ainsi des mêmes gardes que le reste du stockage
 * local (navigation privée, quota dépassé, JSON corrompu).
 */
export function readVisitor(): VisitorProfile | null {
  const [row] = readCollection<VisitorProfile>(COLLECTION)
  return row ?? null
}

/** Le prénom seul : c'est avec lui qu'on s'adresse à quelqu'un, pas avec « M. ». */
export function firstName(profile: VisitorProfile | null): string | null {
  const full = profile?.name?.trim()
  if (!full) return null
  const first = full.split(/\s+/)[0]
  // Un nom saisi en capitales — fréquent au clavier d'un téléphone — reviendrait
  // en « BONJOUR KOUADIO ». On le rhabille.
  return first.length > 1 && first === first.toUpperCase()
    ? first[0] + first.slice(1).toLowerCase()
    : first
}

/**
 * Enregistre les coordonnées telles qu'elles viennent d'être envoyées.
 *
 * Les champs vides n'écrasent pas ce qui était connu : une demande où l'on n'a
 * pas redonné son entreprise ne doit pas faire oublier l'entreprise.
 */
export function rememberVisitor(
  contact: { name?: string; company?: string; phone?: string; email?: string; city?: string },
  reference?: string,
): void {
  const previous = readVisitor()
  const keep = (next: string | undefined, before: string | undefined) =>
    (next ?? '').trim() || (before ?? '')

  const references = previous?.references ?? []
  const next: VisitorProfile = {
    name: keep(contact.name, previous?.name),
    company: keep(contact.company, previous?.company),
    phone: keep(contact.phone, previous?.phone),
    email: keep(contact.email, previous?.email),
    city: keep(contact.city, previous?.city),
    references: reference && !references.includes(reference) ? [reference, ...references] : references,
    updatedAt: new Date().toISOString(),
  }
  writeCollection(COLLECTION, [next])
}

/** Vide le carnet. Proposé partout où les coordonnées reviennent préremplies. */
export function forgetVisitor(): void {
  writeCollection(COLLECTION, [])
}

/** Les valeurs de formulaire à préremplir pour l'étape des coordonnées. */
export function contactDefaults(
  profile: VisitorProfile | null,
  /**
   * Le compte connecté, s'il y en a un.
   *
   * Il prime sur la mémoire de l'appareil : celle-ci garde ce qui a été tapé
   * la dernière fois, lui porte ce que la personne a déclaré en s'inscrivant.
   * Quand les deux divergent — un téléphone partagé, un collègue qui a déposé
   * une demande depuis le même poste — c'est le compte qui dit la vérité.
   *
   * Un formulaire prérempli reste relu et corrigé avant l'envoi : il fait
   * gagner la saisie, il ne décide de rien.
   */
  account?: { name?: string; company?: string; phone?: string; email?: string; city?: string } | null,
): Record<string, string> {
  const filled: Record<string, string> = {}
  if (profile?.name) filled.contactName = profile.name
  if (profile?.company) filled.contactCompany = profile.company
  if (profile?.phone) filled.contactPhone = profile.phone
  if (profile?.email) filled.contactEmail = profile.email
  if (profile?.city) filled.contactCity = profile.city

  if (account?.name) filled.contactName = account.name
  if (account?.company) filled.contactCompany = account.company
  if (account?.phone) filled.contactPhone = account.phone
  if (account?.email) filled.contactEmail = account.email
  if (account?.city) filled.contactCity = account.city
  return filled
}
