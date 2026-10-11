/**
 * Ce que l'utilisateur voit de l'avancement.
 *
 * <h2>Deux lectures, pas une</h2>
 *
 * Un dossier se lit à deux niveaux. En liste, on veut savoir s'il faut s'en
 * occuper : quatre statuts suffisent, et quatre seulement — nouvelle demande,
 * en cours, terminée, annulée. Ouvert, on veut savoir où il en est : la frise
 * montre cinq étapes, pas une de plus.
 *
 * Les deux se déduisent du même état interne. Les tenir séparément les ferait
 * diverger au premier état ajouté.
 *
 * <h2>Pourquoi cinq, et pas dix</h2>
 *
 * Le serveur compte dix états pour une demande, seize pour un achat, onze pour
 * un engin. Ce sont des rouages : ils disent où en est le traitement, pas où
 * en est le dossier. Affichés tels quels, ils faisaient lire au client des
 * étapes dont il n'avait rien à faire — « analyse commerciale », « devis en
 * préparation » — et le faisaient attendre devant une frise qui n'avançait
 * pas.
 *
 * <h2>Les issues ne sont pas des étapes</h2>
 *
 * Un refus, une annulation, une clôture n'allongent pas le parcours : ils
 * l'interrompent. La frise s'arrête où elle en était et le statut passe à
 * « Annulée ». Les trois se distinguent dans les données internes — voir
 * `outcome` côté serveur — mais pas à l'écran : le client n'a pas à lire nos
 * catégories.
 */

/** Les quatre seuls statuts qu'un utilisateur lit en liste. */
export type StatutVisible = 'NOUVELLE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'

export const STATUT_LIBELLE: Record<StatutVisible, string> = {
  NOUVELLE: 'Nouvelle demande',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
}

export const STATUT_STYLE: Record<StatutVisible, string> = {
  NOUVELLE: 'bg-amber-100 text-amber-800',
  EN_COURS: 'bg-btp-100 text-btp-800',
  TERMINEE: 'bg-emerald-100 text-emerald-800',
  ANNULEE: 'bg-slate-200 text-slate-600',
}

export interface Parcours {
  /** Les cinq étapes, dans l'ordre. Jamais plus. */
  etapes: readonly string[]
  /** L'étape atteinte (1 à 5), ou 0 si le dossier s'est arrêté avant. */
  etape: (etat: string) => number
  statut: (etat: string) => StatutVisible
}

/** Un dossier arrêté : la frise s'arrête, le statut dit « Annulée ». */
const ARRETE = new Set(['CLOSED', 'CANCELLED', 'REJECTED', 'DECLINED', 'WITHDRAWN'])

/**
 * Demande de prestation ou de devis.
 *
 * Dix états internes repliés sur cinq. « Recherche en cours » couvre aussi
 * bien la qualification que la mise en relation d'un fournisseur ou le
 * chiffrage par VOLTA : de l'extérieur, c'est le même temps d'attente, et le
 * distinguer n'apprendrait au client que notre organisation.
 */
export const PARCOURS_DEMANDE: Parcours = {
  etapes: [
    'Demande envoyée',
    'Recherche en cours',
    'Proposition envoyée',
    'Prestation en cours',
    'Prestation terminée',
  ],
  etape: (etat) => {
    switch (etat) {
      case 'RECEIVED':
        return 1
      case 'QUALIFYING':
      case 'SEARCHING':
      case 'QUOTE_DRAFT':
        return 2
      case 'QUOTE_SENT':
        return 3
      case 'VALIDATED':
      case 'MATCHED':
      case 'MISSION':
        return 4
      case 'DONE':
        return 5
      default:
        return 0
    }
  },
  statut: (etat) => {
    if (ARRETE.has(etat)) return 'ANNULEE'
    if (etat === 'DONE') return 'TERMINEE'
    if (etat === 'RECEIVED') return 'NOUVELLE'
    return 'EN_COURS'
  },
}

/**
 * Achat sur Volta Market.
 *
 * Une vente, pas une prestation : elle se confirme puis se livre. Les trois
 * états de vérification du serveur — qualification, disponibilité, analyse
 * commerciale — sont un seul temps pour l'acheteur.
 */
export const PARCOURS_ACHAT: Parcours = {
  etapes: [
    'Commande envoyée',
    'Vérification en cours',
    'Proposition envoyée',
    'Commande confirmée',
    'Commande livrée',
  ],
  etape: (etat) => {
    switch (etat) {
      case 'RECEIVED':
        return 1
      case 'QUALIFYING':
      case 'AVAILABILITY_CHECK':
      case 'COMMERCIAL_REVIEW':
        return 2
      case 'OFFER':
      case 'NEGOTIATION':
        return 3
      case 'VALIDATED':
      case 'SOLD':
        return 4
      case 'DELIVERED':
        return 5
      default:
        return 0
    }
  },
  statut: (etat) => {
    if (ARRETE.has(etat)) return 'ANNULEE'
    if (etat === 'DELIVERED') return 'TERMINEE'
    if (etat === 'RECEIVED') return 'NOUVELLE'
    return 'EN_COURS'
  },
}

/**
 * Inscription et publication d'un engin.
 *
 * Le fournisseur suit sa machine du dépôt de la fiche à sa mise en ligne.
 * « Vérification finale » couvre le rapport reçu, son examen et l'attribution
 * de la catégorie de prestance : trois états internes pour une seule attente.
 *
 * Une correction demandée ou un refus arrêtent la frise. L'écran doit alors
 * dire ce qui est attendu — un fournisseur qui voit sa machine s'arrêter sans
 * explication ne la reprend pas, il appelle.
 */
export const PARCOURS_ENGIN: Parcours = {
  etapes: [
    'Fiche créée',
    'Engin soumis',
    'Inspection en cours',
    'Vérification finale',
    'Engin publié',
  ],
  etape: (etat) => {
    switch (etat) {
      case 'DRAFT':
        return 1
      case 'SUBMITTED':
        return 2
      case 'PENDING_INSPECTION':
      case 'INSPECTION_IN_PROGRESS':
        return 3
      case 'REPORT_SUBMITTED':
      case 'PENDING_ADMIN_REVIEW':
      case 'REFERENCED':
        return 4
      case 'PUBLISHED':
        return 5
      default:
        return 0
    }
  },
  statut: (etat) => {
    if (etat === 'REJECTED' || etat === 'UNPUBLISHED' || etat === 'CORRECTIONS_REQUESTED') {
      return 'ANNULEE'
    }
    if (etat === 'PUBLISHED') return 'TERMINEE'
    if (etat === 'DRAFT') return 'NOUVELLE'
    return 'EN_COURS'
  },
}

/**
 * Candidature à l'équipe technique.
 *
 * Le recrutement traversait les dix états avec ses propres mots : candidature
 * reçue, en examen, profil étudié, entretien à programmer, entretien
 * programmé, acceptée, compte créé, en mission, intégration terminée. Neuf
 * étapes affichées à un candidat qui veut savoir une chose — où en est son
 * dossier.
 *
 * Cinq suffisent. « Entretien » couvre la programmation et la tenue : du point
 * de vue du candidat, c'est le même temps, celui où il attend une date puis
 * une réponse. « Intégration » couvre la création de son compte et sa première
 * mission.
 */
export const PARCOURS_CANDIDATURE: Parcours = {
  etapes: [
    'Candidature reçue',
    'Profil à l’étude',
    'Entretien',
    'Candidature acceptée',
    'Intégration terminée',
  ],
  etape: (etat) => {
    switch (etat) {
      case 'RECEIVED':
        return 1
      case 'QUALIFYING':
      case 'SEARCHING':
        return 2
      case 'QUOTE_DRAFT':
      case 'QUOTE_SENT':
        return 3
      case 'VALIDATED':
      case 'MATCHED':
      case 'MISSION':
        return 4
      case 'DONE':
        return 5
      default:
        return 0
    }
  },
  statut: (etat) => {
    if (ARRETE.has(etat)) return 'ANNULEE'
    if (etat === 'DONE') return 'TERMINEE'
    if (etat === 'RECEIVED') return 'NOUVELLE'
    return 'EN_COURS'
  },
}

/**
 * Le parcours d'un dossier, d'après ce qu'il est.
 *
 * Une candidature et une demande de pelle ne traversent pas les mêmes temps ;
 * leur faire partager une frise obligerait à nommer les étapes assez vaguement
 * pour convenir aux deux, c'est-à-dire à ne rien dire.
 */
export function parcoursPour(intent?: string | null): Parcours {
  return intent === 'JOIN_TECHNICAL_TEAM' ? PARCOURS_CANDIDATURE : PARCOURS_DEMANDE
}

/**
 * Le badge d'un dossier, pour une liste.
 *
 * Quatre mots, et quatre seulement. Les écrans affichaient les dix états avec
 * leurs noms internes — « Proposition envoyée », « Acceptée », « En cours » —
 * ce qui obligeait à lire chaque ligne pour savoir laquelle demandait une
 * action. Quatre catégories se balaient d'un regard, et le détail reste dans
 * la frise une fois le dossier ouvert.
 */
export function badgeDe(etat: string, parcours: Parcours = PARCOURS_DEMANDE) {
  const statut = parcours.statut(etat)
  return { statut, libelle: STATUT_LIBELLE[statut], classe: STATUT_STYLE[statut] }
}
