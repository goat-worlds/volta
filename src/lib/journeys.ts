/**
 * Les parcours.
 *
 * Huit intentions, huit formulaires — mais une seule mécanique. Chaque parcours
 * est une suite d'étapes et de champs déclarés ici ; le composant qui les rend
 * ne connaît aucun d'eux en particulier. Écrire huit pages de saisie aurait
 * donné huit validations, huit fils d'étapes et huit écrans de confirmation à
 * maintenir en accord, pour des questions qui ne diffèrent que par leur objet.
 *
 * L'étape des coordonnées est ajoutée automatiquement en fin de parcours : elle
 * est identique partout, et la répéter dans chaque définition finirait par la
 * faire diverger d'un formulaire à l'autre.
 */
import type { FieldOption } from '../components/requests/fields'
import type { IntentId, RequestKind } from '../types/domain'

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'select'
  | 'date'
  | 'number'
  | 'tel'
  | 'email'
  | 'checkbox'
  | 'tags'
  | 'file'

export interface FieldDef {
  name: string
  label: string
  kind: FieldKind
  required?: boolean
  help?: string
  placeholder?: string
  options?: FieldOption[]
  /** Occupe les deux colonnes : descriptions, contraintes, listes de pastilles. */
  full?: boolean
  /** Types acceptés par un champ de fichier, au format de l'attribut HTML. */
  accept?: string
  /** Nombre maximal de choix, pour un champ à pastilles. */
  max?: number
  /**
   * Champ qui ne se montre que dans certains cas — « Autre » coché, par
   * exemple. Toujours affiché quand la fonction est absente, et un champ
   * masqué ne peut pas bloquer la validation de l'étape.
   */
  showIf?: (values: Record<string, string>) => boolean
}

export interface StepDef {
  title: string
  intro?: string
  fields: FieldDef[]
  /**
   * Ce que l'étape suivante dit de ce qui vient d'être saisi.
   *
   * Un formulaire qui affiche « Étape 2 sur 3 · Votre projet » pourrait servir
   * n'importe qui. Celui qui affiche « Votre pelle hydraulique, à Yopougon »
   * montre qu'il a lu. La fonction renvoie null quand il n'y a rien à
   * reprendre — mieux vaut ne rien dire qu'une phrase à trous.
   */
  echo?: (values: Record<string, string>) => string | null
}

export interface Journey {
  intent: IntentId
  kind: RequestKind
  /** Titre de la page — reprend la formulation de l'intention. */
  title: string
  subtitle: string
  steps: StepDef[]
  /** Objet de la demande tel qu'il apparaîtra dans le centre des demandes. */
  subject: (values: Record<string, string>) => string
  /** Ce que l'écran de confirmation promet — jamais un délai non tenu. */
  promise: string
  /**
   * La demande relue à la première personne, avant l'envoi.
   *
   * Chaque parcours écrit la sienne : une candidature de mécanicien et une
   * demande de pelle ne se racontent pas avec les mêmes mots, et une phrase
   * assemblée mécaniquement à partir des libellés de champs se reconnaîtrait
   * immédiatement. Les lignes vides sont écartées par l'appelant.
   */
  recap: (values: Record<string, string>) => (string | null)[]
}

/** Raccourci de rédaction : « 3 semaines » plutôt que « undefined ». */
const said = (value: string | undefined, fallback = ''): string =>
  (value ?? '').trim() || fallback

/**
 * Une date d'input telle qu'on la dirait au téléphone : « 3 octobre ».
 *
 * Relire sa propre demande sous la forme « 2026-10-03 » donne le sentiment de
 * vérifier une ligne de base de données. La valeur brute est renvoyée telle
 * quelle si elle n'est pas une date — un champ à moitié saisi ne doit pas
 * produire « Invalid Date » en plein récapitulatif.
 */
const frenchDate = (value: string | undefined): string => {
  const raw = (value ?? '').trim()
  if (!raw) return ''
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return raw
  return parsed.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

/* ------------------------------------------------------------------ */
/* Vocabulaire partagé                                                 */
/* ------------------------------------------------------------------ */

const opts = (...labels: string[]): FieldOption[] =>
  labels.map((label) => ({ value: label, label }))

const EQUIPMENT_CATEGORIES = opts(
  'Terrassement',
  'Levage',
  'Transport',
  'Compactage',
  'Forage',
  'Énergie',
  'Manutention',
  'Autre',
)

const URGENCY = opts('Immédiate', 'Sous 24 h', 'Sous 48 h', 'Cette semaine', 'Planifiée')

const TRADES = opts(
  'Mécanicien',
  'Mécanicien auto',
  'Mécanicien diesel',
  'Hydraulicien',
  'Électricien',
  'Électromécanicien',
  'Technicien de maintenance',
  'Opérateurs d’engins',
  'Soudeur',
  // Une liste fermée écarte des métiers réels — tôlier, pneumaticien,
  // grutier… — et force le candidat à se ranger dans une case qui n'est pas
  // la sienne. « Autre » ouvre un champ libre plutôt que de perdre le profil.
  'Autre',
)

const SKILLS = opts(
  'Mécanique',
  'Mécanique diesel',
  'Hydraulique',
  'Électricité',
  'Électromécanique',
  'Diagnostic',
  'Maintenance préventive',
  'Maintenance corrective',
  'Engins lourds',
)

const AVAILABILITY = opts(
  'Immédiatement',
  'À partir d’une date',
  'Sous délai',
  'Indisponible',
)

/**
 * Étape des coordonnées.
 *
 * Elle vient toujours en dernier : demander qui vous êtes avant de savoir ce
 * que vous voulez fait abandonner ceux qui n'étaient venus que se renseigner.
 */
const CONTACT_STEP: StepDef = {
  title: 'Vos coordonnées',
  intro: 'Pour que VOLTA puisse revenir vers vous avec une proposition.',
  fields: [
    { name: 'contactName', label: 'Nom et prénom', kind: 'text', required: true },
    { name: 'contactCompany', label: 'Entreprise', kind: 'text' },
    {
      name: 'contactPhone',
      label: 'Téléphone',
      kind: 'tel',
      required: true,
      placeholder: '+225 07 00 00 00 00',
    },
    { name: 'contactEmail', label: 'Email', kind: 'email', required: true },
    { name: 'contactCity', label: 'Localisation', kind: 'text', required: true },
  ],
}

/* ------------------------------------------------------------------ */
/* Parcours                                                            */
/* ------------------------------------------------------------------ */

const RENT: Journey = {
  intent: 'RENT_EQUIPMENT',
  kind: 'RENTAL',
  title: 'Je veux louer un engin',
  subtitle:
    'Décrivez votre besoin. VOLTA identifie l’équipement adapté et vous revient avec une proposition.',
  promise:
    'Notre équipe analyse votre besoin et reviendra vers vous avec une solution adaptée.',
  subject: (v) => `Location — ${v.equipmentType || 'engin'} à ${v.siteLocation || 'préciser'}`,
  recap: (v) => [
    `Je cherche ${said(v.equipmentType, 'un engin').toLowerCase()}${
      Number(v.quantity) > 1 ? ` — ${v.quantity} unités` : ''
    }${v.brandModel ? `, de préférence un ${v.brandModel}` : ''}.`,
    v.siteLocation
      ? `Le chantier est à ${v.siteLocation}${v.siteType ? `, en ${v.siteType.toLowerCase()}` : ''}.`
      : null,
    v.startDate
      ? `J’en ai besoin à partir du ${frenchDate(v.startDate)}${v.duration ? `, pour ${v.duration}` : ''}.`
      : null,
    v.needsTransport === 'oui' && v.needsOperator === 'oui'
      ? 'Il me faut aussi le transport et un opérateur.'
      : v.needsTransport === 'oui'
        ? 'Il me faut aussi le transport jusqu’au chantier.'
        : v.needsOperator === 'oui'
          ? 'Il me faut aussi un opérateur.'
          : null,
    v.constraints ? `À savoir : ${v.constraints}` : null,
  ],
  steps: [
    {
      title: 'Votre besoin',
      intro: 'Ce que vous cherchez, pour combien de temps et où.',
      fields: [
        {
          name: 'equipmentType',
          label: 'Type d’engin',
          kind: 'text',
          required: true,
          placeholder: 'Pelle hydraulique, camion benne…',
        },
        {
          name: 'category',
          label: 'Catégorie',
          kind: 'select',
          options: EQUIPMENT_CATEGORIES,
          required: true,
        },
        {
          name: 'brandModel',
          label: 'Marque / modèle',
          kind: 'text',
          help: 'Si vous avez une préférence.',
        },
        { name: 'quantity', label: 'Quantité', kind: 'number', required: true },
        {
          name: 'duration',
          label: 'Durée',
          kind: 'text',
          required: true,
          placeholder: '3 semaines',
        },
        { name: 'startDate', label: 'Date de début', kind: 'date', required: true },
        { name: 'endDate', label: 'Date de fin', kind: 'date' },
        {
          name: 'siteLocation',
          label: 'Localisation du chantier',
          kind: 'text',
          required: true,
          full: true,
        },
      ],
    },
    {
      title: 'Votre projet',
      intro: 'Le contexte nous évite de vous proposer un engin inadapté au terrain.',
      echo: (v) =>
        v.equipmentType
          ? `${v.equipmentType}${Number(v.quantity) > 1 ? ` ×${v.quantity}` : ''}${
              v.siteLocation ? ` · ${v.siteLocation}` : ''
            }${v.startDate ? ` · dès le ${frenchDate(v.startDate)}` : ''}`
          : null,
      fields: [
        {
          name: 'siteType',
          label: 'Type de chantier',
          kind: 'text',
          required: true,
          placeholder: 'Voirie, bâtiment, carrière…',
        },
        { name: 'intendedUse', label: 'Utilisation prévue', kind: 'text' },
        {
          name: 'description',
          label: 'Description du besoin',
          kind: 'textarea',
          required: true,
          full: true,
        },
        {
          name: 'constraints',
          label: 'Contraintes',
          kind: 'textarea',
          full: true,
          help: 'Accès, horaires, sol, hauteur disponible…',
        },
        {
          name: 'needsTransport',
          label: 'J’ai besoin du transport ou de la livraison',
          kind: 'checkbox',
        },
        {
          name: 'needsOperator',
          label: 'J’ai besoin d’un opérateur ou d’un technicien',
          kind: 'checkbox',
        },
      ],
    },
    CONTACT_STEP,
  ],
}

const BUY: Journey = {
  intent: 'BUY_EQUIPMENT',
  kind: 'PURCHASE',
  title: 'Je veux acheter un engin',
  subtitle:
    'Votre demande est adressée à VOLTA, qui vérifie la disponibilité et prépare votre offre.',
  promise:
    'VOLTA vérifie la disponibilité et l’état de l’équipement, puis vous adresse une offre.',
  subject: (v) => `Achat — ${v.equipmentType || 'équipement'} × ${v.quantity || '1'}`,
  recap: (v) => [
    `Je veux acheter ${said(v.equipmentType, 'un équipement').toLowerCase()}${
      Number(v.quantity) > 1 ? ` — ${v.quantity} unités` : ''
    }${v.brandModel ? `, de préférence un ${v.brandModel}` : ''}.`,
    v.condition ? `Je le cherche en ${v.condition.toLowerCase()}.` : null,
    v.budget ? `Mon budget indicatif tourne autour de ${v.budget}.` : null,
    v.deadline ? `Mon délai : ${v.deadline.toLowerCase()}.` : null,
    v.details ? `Précision : ${v.details}` : null,
  ],
  steps: [
    {
      title: 'L’équipement recherché',
      fields: [
        { name: 'equipmentType', label: 'Équipement', kind: 'text', required: true },
        {
          name: 'category',
          label: 'Catégorie',
          kind: 'select',
          options: EQUIPMENT_CATEGORIES,
          required: true,
        },
        { name: 'brandModel', label: 'Marque / modèle', kind: 'text' },
        { name: 'quantity', label: 'Quantité', kind: 'number', required: true },
        {
          name: 'condition',
          label: 'État souhaité',
          kind: 'select',
          options: opts('Neuf', 'Occasion', 'Indifférent'),
        },
        {
          name: 'budget',
          label: 'Budget indicatif',
          kind: 'text',
          help: 'Facultatif — il oriente la recherche, il n’engage pas.',
        },
        { name: 'deadline', label: 'Délai souhaité', kind: 'select', options: URGENCY },
        {
          name: 'details',
          label: 'Informations complémentaires',
          kind: 'textarea',
          full: true,
        },
      ],
    },
    CONTACT_STEP,
  ],
}

const TECHNICIAN: Journey = {
  intent: 'FIND_TECHNICIAN',
  kind: 'TECHNICIAN',
  title: 'Je recherche un technicien',
  subtitle:
    'Nos profils sont étudiés, auditionnés et sélectionnés par VOLTA avant d’être proposés.',
  promise:
    'VOLTA recherche dans son vivier le profil correspondant et vous adresse une proposition.',
  subject: (v) => `Technicien ${v.trade || ''} — ${v.city || 'à préciser'}`.trim(),
  recap: (v) => [
    `Je cherche un ${said(v.trade, 'technicien').toLowerCase()}${
      v.specialty ? ` spécialisé en ${v.specialty.toLowerCase()}` : ''
    }.`,
    v.city ? `L’intervention est à ${v.city}.` : null,
    v.startDate
      ? `Je le voudrais pour le ${frenchDate(v.startDate)}${
          v.urgency ? ` — urgence : ${v.urgency.toLowerCase()}` : ''
        }${v.duration ? `, sur ${v.duration}` : ''}.`
      : null,
    v.description ? `Ce qu’il y a à faire : ${v.description}` : null,
  ],
  steps: [
    {
      title: 'Le profil recherché',
      fields: [
        { name: 'trade', label: 'Métier', kind: 'select', options: TRADES, required: true },
        { name: 'specialty', label: 'Spécialité', kind: 'text' },
        { name: 'city', label: 'Lieu d’intervention', kind: 'text', required: true },
        { name: 'startDate', label: 'Date souhaitée', kind: 'date', required: true },
        { name: 'urgency', label: 'Urgence', kind: 'select', options: URGENCY, required: true },
        { name: 'duration', label: 'Durée de la mission', kind: 'text' },
        {
          name: 'description',
          label: 'Description du besoin',
          kind: 'textarea',
          required: true,
          full: true,
          help: 'Panne constatée, équipement concerné, conditions d’accès.',
        },
      ],
    },
    CONTACT_STEP,
  ],
}

const OFFER_EQUIPMENT: Journey = {
  intent: 'OFFER_EQUIPMENT',
  kind: 'EQUIPMENT_OFFER',
  title: 'Je veux mettre mon engin en location',
  subtitle:
    'Présentez votre équipement. VOLTA le vérifie, puis identifie les opportunités qui lui correspondent.',
  promise:
    'Votre fiche est étudiée par VOLTA. Une vérification sera planifiée avant toute publication.',
  subject: (v) => `Engin proposé — ${v.brand || ''} ${v.model || ''}`.trim(),
  recap: (v) => [
    `Je propose à la location ${said(v.equipmentType, 'mon engin').toLowerCase()}${
      v.brand || v.model ? ` — ${said(v.brand)} ${said(v.model)}`.trimEnd() : ''
    }${v.year ? `, de ${v.year}` : ''}.`,
    v.condition
      ? `Je le déclare en ${v.condition.toLowerCase()} état${
          v.hours ? `, avec ${Number(v.hours).toLocaleString('fr-FR')} heures au compteur` : ''
        }.`
      : null,
    v.city ? `Il est basé à ${v.city}${v.zone ? ` et je peux couvrir ${v.zone}` : ''}.` : null,
    v.availability ? `Disponibilité : ${v.availability.toLowerCase()}.` : null,
    v.dailyRate ? `Mon tarif indicatif : ${v.dailyRate}.` : null,
    v.transport === 'oui' && v.operator === 'oui'
      ? 'Je peux fournir le transport et un opérateur.'
      : v.transport === 'oui'
        ? 'Je peux assurer le transport.'
        : v.operator === 'oui'
          ? 'Je peux fournir un opérateur.'
          : null,
  ],
  steps: [
    {
      title: 'Identification',
      fields: [
        { name: 'equipmentType', label: 'Type d’engin', kind: 'text', required: true },
        {
          name: 'category',
          label: 'Catégorie',
          kind: 'select',
          options: EQUIPMENT_CATEGORIES,
          required: true,
        },
        { name: 'brand', label: 'Marque', kind: 'text', required: true },
        { name: 'model', label: 'Modèle', kind: 'text', required: true },
        { name: 'year', label: 'Année', kind: 'number' },
        { name: 'serial', label: 'Numéro de série / référence interne', kind: 'text' },
      ],
    },
    {
      title: 'État et disponibilité',
      intro:
        'Ces informations sont enregistrées comme déclarées. Elles seront confrontées à une vérification avant publication.',
      echo: (v) =>
        v.brand || v.model
          ? `${said(v.brand)} ${said(v.model)}${v.year ? ` · ${v.year}` : ''}`.trim()
          : null,
      fields: [
        {
          name: 'condition',
          label: 'État général',
          kind: 'select',
          options: opts('Excellent', 'Bon', 'Correct', 'À réviser'),
          required: true,
        },
        { name: 'hours', label: 'Heures d’utilisation', kind: 'number' },
        { name: 'maintenance', label: 'Entretien', kind: 'text' },
        {
          name: 'lastWork',
          label: 'Dernières interventions',
          kind: 'textarea',
          full: true,
        },
        {
          name: 'availability',
          label: 'Disponibilité',
          kind: 'select',
          options: AVAILABILITY,
          required: true,
        },
        { name: 'availableFrom', label: 'Disponible à partir du', kind: 'date' },
        { name: 'city', label: 'Ville', kind: 'text', required: true },
        { name: 'zone', label: 'Zone', kind: 'text' },
      ],
    },
    {
      title: 'Conditions commerciales',
      echo: (v) =>
        v.city ? `Basé à ${v.city}${v.availability ? ` · ${v.availability.toLowerCase()}` : ''}` : null,
      fields: [
        {
          name: 'dailyRate',
          label: 'Tarif indicatif',
          kind: 'text',
          help: 'Indicatif : il ne sera pas publié comme un prix ferme.',
        },
        { name: 'minDuration', label: 'Durée minimale', kind: 'text' },
        { name: 'terms', label: 'Conditions', kind: 'textarea', full: true },
        { name: 'transport', label: 'Le transport peut être assuré', kind: 'checkbox' },
        { name: 'operator', label: 'Un opérateur peut être fourni', kind: 'checkbox' },
        {
          name: 'documents',
          label: 'Documents disponibles',
          kind: 'tags',
          full: true,
          options: opts(
            'Titre de propriété',
            'Mise à disposition',
            'Carte grise',
            'Assurance',
            'Documents techniques',
            'Documents douaniers',
          ),
        },
      ],
    },
    CONTACT_STEP,
  ],
}

const LIST_CATALOG: Journey = {
  intent: 'LIST_CATALOG',
  kind: 'EQUIPMENT_OFFER',
  title: 'Je veux présenter mes équipements',
  subtitle: 'Référencez vos équipements, produits et solutions sur Volta.',
  promise:
    'VOLTA étudie votre catalogue et vous accompagne dans sa structuration avant publication.',
  subject: (v) => `Catalogue — ${v.legalName || 'entreprise'}`,
  recap: (v) => [
    `${said(v.legalName, 'Mon entreprise')} veut référencer son catalogue sur VOLTA.`,
    v.sector
      ? `Nous travaillons dans ${v.sector.toLowerCase()}${v.city ? `, depuis ${v.city}` : ''}.`
      : null,
    v.catalogSize ? `Nous avons environ ${v.catalogSize} équipements ou produits à présenter.` : null,
    v.families ? `Familles concernées : ${v.families.split(';').join(', ')}.` : null,
    v.coverage ? `Nous intervenons sur ${v.coverage}.` : null,
  ],
  steps: [
    {
      title: 'Votre entreprise',
      fields: [
        { name: 'legalName', label: 'Raison sociale', kind: 'text', required: true },
        { name: 'sector', label: 'Secteur', kind: 'text', required: true },
        { name: 'city', label: 'Localisation', kind: 'text', required: true },
        {
          name: 'coverage',
          label: 'Zones d’intervention',
          kind: 'text',
          help: 'Séparées par des virgules.',
        },
        { name: 'description', label: 'Description', kind: 'textarea', full: true },
      ],
    },
    {
      title: 'Votre catalogue',
      echo: (v) => (v.legalName ? `${v.legalName}${v.sector ? ` · ${v.sector}` : ''}` : null),
      fields: [
        {
          name: 'catalogSize',
          label: 'Nombre d’équipements ou de produits',
          kind: 'number',
          required: true,
        },
        {
          name: 'families',
          label: 'Familles de produits',
          kind: 'tags',
          full: true,
          options: EQUIPMENT_CATEGORIES,
        },
        { name: 'services', label: 'Services associés', kind: 'textarea', full: true },
        {
          name: 'catalogUrl',
          label: 'Catalogue en ligne',
          kind: 'text',
          help: 'Lien vers un catalogue existant, s’il y en a un.',
        },
      ],
    },
    CONTACT_STEP,
  ],
}

const GOLD: Journey = {
  intent: 'BECOME_GOLD',
  kind: 'GOLD',
  title: 'Je veux devenir GOLD',
  subtitle:
    'Valorisez votre entreprise, améliorez votre référencement et augmentez votre visibilité auprès des opportunités correspondant à vos capacités.',
  promise:
    'Votre candidature entre en analyse documentaire. VOLTA vous transmettra ses recommandations avant l’audit.',
  subject: (v) => `Candidature GOLD — ${v.legalName || 'entreprise'}`,
  recap: (v) => [
    `${said(v.legalName, 'Mon entreprise')} candidate à la qualification GOLD.`,
    v.sector
      ? `Nous sommes dans ${v.sector.toLowerCase()}${v.city ? `, à ${v.city}` : ''}${
          v.staff ? `, à ${v.staff} personnes` : ''
        }.`
      : null,
    v.services ? `Ce que nous savons faire : ${v.services}` : null,
    v.certifications ? `Nos certifications : ${v.certifications}` : null,
    v.coverage ? `Nous couvrons ${v.coverage}.` : null,
  ],
  steps: [
    {
      title: 'Votre entreprise',
      fields: [
        { name: 'legalName', label: 'Raison sociale', kind: 'text', required: true },
        { name: 'sector', label: 'Secteur', kind: 'text', required: true },
        { name: 'city', label: 'Localisation', kind: 'text', required: true },
        { name: 'staff', label: 'Effectif', kind: 'number' },
        { name: 'description', label: 'Description', kind: 'textarea', required: true, full: true },
      ],
    },
    {
      title: 'Capacités et références',
      intro: 'Ce sont ces éléments qui fondent l’évaluation.',
      echo: (v) => (v.legalName ? `Candidature de ${v.legalName}` : null),
      fields: [
        { name: 'services', label: 'Services proposés', kind: 'textarea', required: true, full: true },
        { name: 'certifications', label: 'Certifications', kind: 'textarea', full: true },
        { name: 'clientRefs', label: 'Références clients', kind: 'textarea', full: true },
        {
          name: 'coverage',
          label: 'Zones d’intervention',
          kind: 'text',
          required: true,
          full: true,
        },
      ],
    },
    CONTACT_STEP,
  ],
}

const SUPPORT: Journey = {
  intent: 'GROW_SALES',
  kind: 'SUPPORT',
  title: 'Je veux développer mes ventes',
  subtitle:
    'VOLTA vous accompagne dans la structuration et la présentation de votre offre.',
  promise:
    'Un conseiller VOLTA étudie votre situation et vous propose un plan d’accompagnement.',
  subject: (v) => `Accompagnement — ${v.legalName || 'entreprise'}`,
  recap: (v) => [
    `${said(v.legalName, 'Mon entreprise')} cherche à développer son activité avec VOLTA.`,
    v.sector ? `Nous sommes dans ${v.sector.toLowerCase()}${v.city ? `, à ${v.city}` : ''}.` : null,
    v.goals ? `Ce que nous visons : ${v.goals.split(';').join(', ').toLowerCase()}.` : null,
    v.context ? `Notre situation : ${v.context}` : null,
  ],
  steps: [
    {
      title: 'Votre situation',
      fields: [
        { name: 'legalName', label: 'Raison sociale', kind: 'text', required: true },
        { name: 'sector', label: 'Secteur', kind: 'text', required: true },
        { name: 'city', label: 'Localisation', kind: 'text', required: true },
        {
          name: 'goals',
          label: 'Ce que vous cherchez à obtenir',
          kind: 'tags',
          full: true,
          options: opts(
            'Développer mes ventes',
            'Améliorer mon profil',
            'Structurer mon offre',
            'Trouver de nouvelles opportunités',
            'Présenter mon catalogue',
          ),
        },
        { name: 'context', label: 'Votre contexte', kind: 'textarea', required: true, full: true },
      ],
    },
    CONTACT_STEP,
  ],
}

const JOIN_TEAM: Journey = {
  intent: 'JOIN_TECHNICAL_TEAM',
  kind: 'SUPPORT',
  title: 'Je veux rejoindre l’équipe technique',
  subtitle: 'Mettez vos compétences au service de projets industriels et techniques.',
  promise:
    'Votre candidature est enregistrée. Elle sera étudiée, puis vous serez contacté pour la suite du processus.',
  subject: (v) => `Candidature — ${v.trade || 'technicien'}`,
  recap: (v) => [
    `Je suis ${said(v.trade, 'technicien').toLowerCase()}${
      v.specialty ? `, spécialisé en ${v.specialty.toLowerCase()}` : ''
    }${v.experience ? `, avec ${v.experience} ans de métier` : ''}.`,
    v.skills ? `Je sais faire : ${v.skills.split(';').join(', ').toLowerCase()}.` : null,
    v.certifications ? `Mes permis et habilitations : ${v.certifications}` : null,
    v.availability
      ? `Je suis disponible ${v.availability.toLowerCase()}${
          v.mobility ? ` et je peux intervenir sur ${v.mobility}` : ''
        }.`
      : null,
    v.cv ? 'Mon CV est joint à cette candidature.' : null,
  ],
  steps: [
    {
      title: 'Profil professionnel',
      fields: [
        // Deux métiers au plus, trois compétences au plus : beaucoup de
        // profils de terrain en exercent réellement deux. Qui coche tout ne dit
        // plus rien de lui, et l'équipe qui lit ne sait plus quoi retenir.
        {
          name: 'trade',
          label: 'Métier',
          kind: 'tags',
          options: TRADES,
          required: true,
          max: 3,
          full: true,
        },
        {
          name: 'tradeOther',
          label: 'Précisez votre métier',
          kind: 'text',
          required: true,
          full: true,
          placeholder: 'Tôlier, pneumaticien, grutier…',
          showIf: (v) => (v.trade ?? '').split(';').includes('Autre'),
        },
        { name: 'specialty', label: 'Spécialité', kind: 'text', required: true },
        {
          name: 'experience',
          label: 'Années d’expérience',
          kind: 'number',
          required: true,
        },
        {
          name: 'availability',
          label: 'Disponibilité',
          kind: 'select',
          options: AVAILABILITY,
          required: true,
        },
        {
          name: 'mobility',
          label: 'Mobilité géographique',
          kind: 'text',
          full: true,
          help: 'Villes ou régions où vous pouvez intervenir.',
        },
      ],
    },
    {
      title: 'Compétences et certifications',
      echo: (v) =>
        v.trade
          ? `${v.trade}${v.specialty ? ` · ${v.specialty}` : ''}${
              v.experience ? ` · ${v.experience} ans` : ''
            }`
          : null,
      fields: [
        {
          name: 'skills',
          label: 'Compétences',
          kind: 'tags',
          required: true,
          full: true,
          options: SKILLS,
          max: 3,
        },
        {
          name: 'certifications',
          label: 'Permis, habilitations, certificats',
          kind: 'textarea',
          full: true,
        },
        { name: 'training', label: 'Formations', kind: 'textarea', full: true },
      ],
    },
    {
      title: 'Votre CV',
      echo: (v) => (v.skills ? v.skills.split(';').slice(0, 3).join(' · ') : null),
      intro:
        'Le CV aide VOLTA à situer votre parcours, mais il n’est pas obligatoire : beaucoup de bons profils de terrain n’en ont pas sous la main. Ce que vous avez décrit aux étapes précédentes suffit à être lu.',
      fields: [
        {
          name: 'cv',
          label: 'Curriculum vitæ (facultatif)',
          kind: 'file',
          full: true,
          accept: '.pdf,.doc,.docx',
          help: 'PDF de préférence. Conservé avec votre candidature. Vous pouvez postuler sans.',
        },
        {
          name: 'motivation',
          label: 'Quelques mots sur vous',
          kind: 'textarea',
          full: true,
          placeholder: 'Vos chantiers marquants, les engins que vous connaissez le mieux, ce que vous cherchez.',
        },
      ],
    },
    CONTACT_STEP,
  ],
}

export const JOURNEYS: Journey[] = [
  RENT,
  BUY,
  TECHNICIAN,
  OFFER_EQUIPMENT,
  LIST_CATALOG,
  GOLD,
  SUPPORT,
  JOIN_TEAM,
]

export function journeyFor(intent: IntentId): Journey | undefined {
  return JOURNEYS.find((journey) => journey.intent === intent)
}
