import { useSyncExternalStore } from 'react'

/**
 * Le son des notifications.
 *
 * Un compteur qui change dans un coin de l'écran ne se remarque pas : le
 * fournisseur dont la réservation vient d'être confirmée, l'administration à
 * qui un dossier arrive, le technicien qui reçoit une mission l'apprenaient en
 * revenant par hasard sur la page. Deux notes brèves disent « il s'est passé
 * quelque chose » sans qu'on ait à regarder.
 *
 * Le son est synthétisé plutôt que lu dans un fichier : aucune ressource à
 * télécharger ni à mettre en cache, aucun format à négocier avec le
 * navigateur, et le même rendu dans la WebView de l'application mobile que sur
 * un poste de bureau.
 *
 * Les navigateurs interdisent de jouer un son avant le premier geste de
 * l'utilisateur : le contexte audio naît « suspendu ». `armerSon` le réveille
 * au premier appui ou à la première touche — ce qui ne retarde rien, puisqu'on
 * ne reçoit de notification qu'après s'être connecté, donc après avoir cliqué.
 */

const CLE_PREFERENCE = 'volta_son_notifications'
/** Dernière notification sonnée, partagée entre onglets. */
const CLE_DERNIER_SON = 'volta_son_dernier'
/** Deux sons plus rapprochés que cela n'en font qu'un pour l'oreille. */
const INTERVALLE_MIN_MS = 2500

type AudioContextCtor = typeof AudioContext

let contexte: AudioContext | null = null
let dernierSonA = 0
let arme = false

const ecouteurs = new Set<() => void>()

function prevenir(): void {
  ecouteurs.forEach((ecouteur) => ecouteur())
}

/** Le son est actif tant que l'utilisateur ne l'a pas coupé. */
export function sonActif(): boolean {
  try {
    return localStorage.getItem(CLE_PREFERENCE) !== 'coupe'
  } catch {
    // Stockage refusé : on garde le comportement par défaut, le son.
    return true
  }
}

export function definirSonActif(actif: boolean): void {
  try {
    localStorage.setItem(CLE_PREFERENCE, actif ? 'actif' : 'coupe')
  } catch {
    // Écriture refusée : le choix vaut pour la page ouverte seulement.
  }
  prevenir()
  // Réactiver le son est un geste : c'est le bon moment pour le faire entendre,
  // l'utilisateur sait ainsi ce qu'il vient d'activer.
  if (actif) jouerNotes()
}

function abonner(ecouteur: () => void): () => void {
  ecouteurs.add(ecouteur)
  // Un autre onglet qui coupe le son le coupe ici aussi.
  const surStockage = (e: StorageEvent) => {
    if (e.key === CLE_PREFERENCE) ecouteur()
  }
  window.addEventListener('storage', surStockage)
  return () => {
    ecouteurs.delete(ecouteur)
    window.removeEventListener('storage', surStockage)
  }
}

/** Préférence de son, lue et modifiée depuis un composant. */
export function useSonNotifications(): [boolean, (actif: boolean) => void] {
  const actif = useSyncExternalStore(abonner, sonActif, () => true)
  return [actif, definirSonActif]
}

function obtenirContexte(): AudioContext | null {
  if (contexte) return contexte
  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
  if (!Ctor) return null
  try {
    contexte = new Ctor()
  } catch {
    return null
  }
  return contexte
}

/**
 * Réveille le contexte audio au premier geste de l'utilisateur.
 *
 * Les écouteurs restent en place tant que le contexte n'est pas « running » :
 * Safari peut le suspendre à nouveau après un passage en arrière-plan, et le
 * geste suivant doit pouvoir le relancer.
 */
export function armerSon(): void {
  if (arme || typeof window === 'undefined') return
  arme = true
  const reveiller = () => {
    const ctx = obtenirContexte()
    if (ctx && ctx.state !== 'running') void ctx.resume().catch(() => {})
  }
  window.addEventListener('pointerdown', reveiller, { passive: true })
  window.addEventListener('keydown', reveiller)
  window.addEventListener('touchend', reveiller, { passive: true })
}

/** Une note : attaque franche, extinction douce, et une octave discrète au-dessus. */
function note(ctx: AudioContext, frequence: number, debut: number, duree: number, volume: number): void {
  const enveloppe = ctx.createGain()
  enveloppe.gain.setValueAtTime(0.0001, debut)
  enveloppe.gain.exponentialRampToValueAtTime(volume, debut + 0.012)
  enveloppe.gain.exponentialRampToValueAtTime(0.0001, debut + duree)
  enveloppe.connect(ctx.destination)

  const fondamentale = ctx.createOscillator()
  fondamentale.type = 'sine'
  fondamentale.frequency.setValueAtTime(frequence, debut)
  fondamentale.connect(enveloppe)

  const harmonique = ctx.createOscillator()
  const volumeHarmonique = ctx.createGain()
  harmonique.type = 'sine'
  harmonique.frequency.setValueAtTime(frequence * 2, debut)
  volumeHarmonique.gain.setValueAtTime(0.18, debut)
  harmonique.connect(volumeHarmonique).connect(enveloppe)

  for (const oscillateur of [fondamentale, harmonique]) {
    oscillateur.start(debut)
    oscillateur.stop(debut + duree + 0.05)
  }
}

/** La, puis mi une quinte au-dessus : montant, donc lu comme une arrivée. */
function jouerNotes(): boolean {
  const ctx = obtenirContexte()
  if (!ctx) return false
  if (ctx.state !== 'running') {
    void ctx.resume().catch(() => {})
    return false
  }
  const t = ctx.currentTime + 0.02
  note(ctx, 880, t, 0.32, 0.14)
  note(ctx, 1318.51, t + 0.13, 0.55, 0.11)
  return true
}

/** Vrai si un autre onglet vient déjà de sonner pour cette notification. */
function dejaSonnePar(cle: string): boolean {
  try {
    if (localStorage.getItem(CLE_DERNIER_SON) === cle) return true
    localStorage.setItem(CLE_DERNIER_SON, cle)
  } catch {
    // Sans stockage, chaque onglet décide seul : au pire deux sons.
  }
  return false
}

/**
 * Fait entendre l'arrivée d'une notification.
 *
 * @param cle identifiant de ce qui vient d'arriver : deux onglets ouverts sur
 *   le même compte ne sonnent qu'une fois pour la même notification.
 * @param vibrer appelé en complément (mobile) ou à défaut de son (contexte pas
 *   encore réveillé) — c'est l'application mobile qui fournit le retour
 *   haptique, le navigateur se contente de `navigator.vibrate`.
 */
export function jouerSonNotification(cle?: string, vibrer?: () => void): void {
  if (!sonActif()) return
  const maintenant = Date.now()
  if (maintenant - dernierSonA < INTERVALLE_MIN_MS) return
  if (cle && dejaSonnePar(cle)) return
  dernierSonA = maintenant
  jouerNotes()
  vibrer?.()
}
