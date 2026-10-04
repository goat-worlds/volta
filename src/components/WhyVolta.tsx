import { Award, Building2, Coins, MapPin, Scale, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Card,
  CardGrid,
  CardIcon,
  MoreLink,
  Reveal,
  Section,
  SectionActions,
  SectionCover,
} from './site/SiteKit'

/**
 * Pourquoi choisir VOLTA.
 *
 * <h2>Ce que cette section ne dit plus</h2>
 *
 * Elle s'appelait « Avant la mise en ligne » et racontait l'inspection : le
 * vérificateur qui se déplace, les dix-huit points déroulés, les organes
 * photographiés, le rapport lu, la liste de reprises envoyée au propriétaire.
 * Le propos était vrai, mais c'était la recette, pas le résultat.
 *
 * Deux problèmes. Un prospect qui n'est pas du métier n'a pas à comprendre
 * notre organisation pour nous faire confiance : on lui demandait de lire un
 * mode opératoire quand il voulait savoir ce qu'il y gagne. Et un concurrent y
 * trouvait notre logique de contrôle, nos critères et nos règles de
 * publication, offerts sur la page d'accueil.
 *
 * La section vend donc maintenant ce que le client obtient. Le détail du
 * fonctionnement vit là où il sert : dans les espaces connectés, pour ceux qui
 * ont un dossier à suivre.
 */

/** Ce que le client gagne, dit en trois mots — pas nos indicateurs internes. */
const FACTS = ['Un seul interlocuteur', 'Des offres comparées', 'Sans commission']

const ARGUMENTS: { icon: LucideIcon; term: string; text: string }[] = [
  {
    icon: Layers,
    term: 'Une plateforme, six expertises',
    text: 'Louer, acheter, entretenir, équiper, digitaliser, former : les métiers de Génie Sélect sont accessibles depuis une seule adresse.',
  },
  {
    icon: Award,
    term: 'Des équipements qualifiés',
    text: 'VOLTA s’appuie sur des contrôles techniques et documentaires avant de présenter une offre.',
  },
  {
    icon: Scale,
    term: 'Plusieurs offres, côte à côte',
    text: 'Vous comparez les prix, les délais de mise à disposition et les conditions sur le même écran.',
  },
  {
    icon: Building2,
    term: 'Vous savez à qui vous parlez',
    text: 'Raison sociale, coordonnées, matériel identifié. Pas de numéro anonyme au bout d’une annonce.',
  },
  {
    icon: Coins,
    term: 'Rien n’est prélevé au passage',
    text: 'VOLTA met en relation et ne prend pas de commission. Vous traitez aux conditions convenues entre vous.',
  },
  {
    icon: MapPin,
    term: 'Un accompagnement local',
    text: 'Des équipes en Côte d’Ivoire, qui connaissent les chantiers, les délais et les contraintes du terrain.',
  },
]

export default function WhyVolta() {
  return (
    <Section id="garanties" tone="muted">
      <SectionCover
        tone="muted"
        label="Pourquoi VOLTA"
        title="Vous avez un projet. Nous trouvons la solution."
        text="Pas besoin de connaître le marché des engins pour équiper votre chantier. Dites-nous ce que vous avez à faire : nous identifions la solution adaptée parmi les expertises du groupe, et nous vous accompagnons jusqu’au bout."
        image="/engins/partenaires-poignee-main.jpeg"
        imageAlt="Deux professionnels se serrant la main devant du matériel de chantier"
        reperes={FACTS}
      />

      <CardGrid>
        {ARGUMENTS.map((a, i) => (
          <Reveal key={a.term} delay={(i % 3) * 0.06}>
            <Card>
              <CardIcon icon={a.icon} />
              <h3 className="volta-display mt-4 text-xl leading-tight text-acier-900">{a.term}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-papier-600">{a.text}</p>
            </Card>
          </Reveal>
        ))}
      </CardGrid>

      <SectionActions>
        <MoreLink to="/catalogue">Voir les équipements disponibles</MoreLink>
      </SectionActions>
    </Section>
  )
}
