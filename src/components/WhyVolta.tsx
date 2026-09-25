import { Award, Building2, Coins, FolderOpen, Scale } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Card,
  CardGrid,
  CardIcon,
  MoreLink,
  Reveal,
  Section,
  SectionActions,
  SectionHeader,
} from './site/SiteKit'

/**
 * Ce que VOLTA vérifie à votre place.
 *
 * La section a porté tour à tour trois chiffres encadrés, six cartes à icône,
 * puis un récit en pleine largeur flanqué d'un « 18 » de sept unités de corps
 * en bordure ambre et d'une liste de définitions sur deux colonnes. Le propos
 * était juste ; la forme changeait trois fois en un seul écran.
 *
 * Le récit de l'inspection tient maintenant dans le chapeau — c'est la
 * promesse qui porte toutes les autres, elle est donc dite en premier — et les
 * garanties reprennent la carte commune. Le chiffre reste, en étiquette.
 */

const FACTS = ['18 points de contrôle', 'Sur le lieu de stationnement', 'Rapport lu avant publication']

const GUARANTEES: { icon: LucideIcon; term: string; text: string }[] = [
  {
    icon: Award,
    term: 'Le niveau est attribué, pas déclaré',
    text: 'Basic, Silver ou Gold : c’est l’administration qui tranche, après lecture du rapport. Le propriétaire ne choisit pas la note de sa machine.',
  },
  {
    icon: FolderOpen,
    term: 'Le dossier reste ouvert',
    text: 'Qui a inspecté, quel jour, ce qui a été relevé, ce qu’il reste à corriger. Le fournisseur suit son dossier sans avoir à téléphoner pour savoir où il en est.',
  },
  {
    icon: Scale,
    term: 'Plusieurs devis, côte à côte',
    text: 'Une demande part à plusieurs loueurs. Vous comparez les prix, les délais de mise à disposition et les conditions sur le même écran.',
  },
  {
    icon: Building2,
    term: 'On sait à qui vous confiez le chantier',
    text: 'Raison sociale, coordonnées, parc contrôlé. Pas de numéro de téléphone anonyme au bout d’une annonce.',
  },
  {
    icon: Coins,
    term: 'Rien n’est prélevé au passage',
    text: 'VOLTA met en relation et ne prend pas de commission. Vous traitez aux conditions convenues entre vous.',
  },
]

export default function WhyVolta() {
  return (
    <Section id="garanties" tone="muted">
      <SectionHeader
        tone="muted"
        label="Avant la mise en ligne"
        title="Quelqu’un se déplace et monte sur la machine."
        text="Aucun engin n’entre au catalogue sur parole. Un vérificateur mandaté par Génie Sélect se rend là où la machine travaille, la fait démarrer, déroule dix-huit points de contrôle — moteur, transmission, hydraulique, freinage, sécurité, structure — photographie les organes sensibles et note ce qui cloche."
      />

      <Reveal className="mx-auto mt-6 max-w-2xl text-center">
        <p className="leading-relaxed text-papier-600">
          Son rapport est lu avant toute publication. Si la machine n’est pas en état, elle ne sort
          pas : le propriétaire reçoit la liste de ce qu’il doit reprendre, et la fiche attend.
        </p>
        <ul className="mt-5 flex flex-wrap justify-center gap-1.5">
          {FACTS.map((f) => (
            <li
              key={f}
              className="rounded-full border border-papier-200 bg-white px-3 py-1 text-xs font-semibold text-acier-900"
            >
              {f}
            </li>
          ))}
        </ul>
      </Reveal>

      <CardGrid>
        {GUARANTEES.map((g, i) => (
          <Reveal key={g.term} delay={(i % 3) * 0.06}>
            <Card>
              <CardIcon icon={g.icon} />
              <h3 className="volta-display mt-4 text-xl leading-tight text-acier-900">{g.term}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-papier-600">{g.text}</p>
            </Card>
          </Reveal>
        ))}
      </CardGrid>

      <SectionActions>
        <MoreLink to="/catalogue">Voir les engins qui sont passés par là</MoreLink>
      </SectionActions>
    </Section>
  )
}
