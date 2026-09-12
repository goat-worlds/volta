/**
 * Modules annoncés mais sans serveur derrière.
 *
 * La navigation cible de VOLTA — Missions, Techniciens, Entreprises, Achat,
 * Vente, Mobilité — dépasse ce que l'API sait faire aujourd'hui. Deux
 * options : ne pas en parler, et l'utilisateur ne voit pas où va le produit ;
 * ou dessiner des écrans qui ont l'air de fonctionner, et il découvre en
 * cliquant que rien ne se passe.
 *
 * La liste ci-dessous tient la troisième voie : chaque module absent est
 * nommé, décrit, et l'écran qui l'annonce dit ce qu'il attend du serveur. Le
 * jour où l'endpoint existe, on retire l'entrée d'ici et l'on branche l'écran.
 * Tant qu'elle y est, aucune page ne prétend faire ce que le serveur ne fait pas.
 */
export type FeatureId =
  | 'MARKET_BUY'
  | 'MARKET_SELL'
  | 'MISSIONS'
  | 'TECHNICIANS'
  | 'COMPANIES'
  | 'MATCHING'
  | 'MOBILITY'
  | 'UPLOAD'

export interface Feature {
  id: FeatureId
  title: string
  /** Ce que le module fera, formulé pour l'utilisateur. */
  promise: string
  /** Ce que l'API doit fournir avant que l'écran ait un sens. */
  backend: string[]
}

export const FEATURES: Record<FeatureId, Feature> = {
  MARKET_BUY: {
    id: 'MARKET_BUY',
    title: 'Acheter un engin',
    promise:
      'Parcourir les engins mis en vente, vérifiés par VOLTA, et déposer une offre d’achat suivie jusqu’à la remise des clés.',
    backend: [
      'Annonces de vente (entité, statuts, prix demandé)',
      'Offres d’achat et leur cycle de vie',
      'Endpoints GET/POST /sales, /sales/{id}/offers',
    ],
  },
  MARKET_SELL: {
    id: 'MARKET_SELL',
    title: 'Vendre un engin',
    promise:
      'Mettre un engin en vente depuis sa fiche, avec vérification VOLTA et gestion des offres reçues.',
    backend: [
      'Annonces de vente rattachées à un engin référencé',
      'Réception et réponse aux offres',
      'Endpoints POST /equipment/{id}/sale, /sales/{id}/offers/{offerId}/accept',
    ],
  },
  MISSIONS: {
    id: 'MISSIONS',
    title: 'Missions',
    promise:
      'Une entreprise décrit un besoin — chantier, durée, compétences — et VOLTA compose la mission : engins, techniciens, équipe.',
    backend: [
      'Entité Mission (client, site, période, besoins, statut)',
      'Affectation d’engins et de techniciens à une mission',
      'Endpoints GET/POST /missions, /missions/{id}/assignments',
    ],
  },
  TECHNICIANS: {
    id: 'TECHNICIANS',
    title: 'Techniciens',
    promise:
      'Un annuaire de techniciens et d’opérateurs qualifiés, avec disponibilités, certifications et historique de missions.',
    backend: [
      'Profil technicien (compétences, certifications, zone, disponibilités)',
      'Inscription et validation par l’administration',
      'Endpoints GET/POST /technicians, /technicians/{id}/availability',
    ],
  },
  COMPANIES: {
    id: 'COMPANIES',
    title: 'Entreprises',
    promise:
      'Un espace par entreprise : ses collaborateurs, ses chantiers, ses engins et ses missions au même endroit.',
    backend: [
      'Entité Entreprise et rattachement des utilisateurs',
      'Rôles internes à l’entreprise (responsable, chef de chantier)',
      'Endpoints GET/POST /companies, /companies/{id}/members',
    ],
  },
  MATCHING: {
    id: 'MATCHING',
    title: 'Mise en relation',
    promise:
      'Proposer automatiquement, pour chaque mission, les engins et techniciens disponibles au bon endroit au bon moment.',
    backend: [
      'Missions et techniciens (prérequis)',
      'Calcul de compatibilité (zone, dates, compétences, qualification)',
      'Endpoint GET /missions/{id}/matches',
    ],
  },
  MOBILITY: {
    id: 'MOBILITY',
    title: 'Mobilité',
    promise:
      'Organiser le transport des engins et les déplacements des équipes vers le chantier, et en suivre l’avancement.',
    backend: [
      'Entité Transport (engin, départ, arrivée, transporteur, statut)',
      'Suivi de position ou jalons déclarés',
      'Endpoints GET/POST /transports, /transports/{id}/milestones',
    ],
  },
  UPLOAD: {
    id: 'UPLOAD',
    title: 'Photos et documents',
    promise:
      'Joindre les photos de l’engin, la carte grise, les certificats de contrôle — et les retrouver sur la fiche et dans le rapport.',
    backend: [
      'Stockage de fichiers (objet ou disque) et table des pièces jointes',
      'Contrôle de type et de taille, lien avec l’engin ou l’inspection',
      'Endpoints POST /equipment/{id}/files, GET /files/{id}',
    ],
  },
}
