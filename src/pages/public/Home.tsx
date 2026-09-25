import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import Hero from '../../components/Hero'
import IntentGrid from '../../components/home/IntentGrid'
import MarketShowcase from '../../components/home/MarketShowcase'
import RecruitmentBand from '../../components/home/RecruitmentBand'
import EquipmentCard from '../../components/EquipmentCard'
import HowItWorks from '../../components/HowItWorks'
import WhyVolta from '../../components/WhyVolta'
import VerificationLevels from '../../components/VerificationLevels'
import {
  CtaBanner,
  MoreLink,
  Reveal,
  Section,
  SectionActions,
  SectionHeader,
} from '../../components/site/SiteKit'

/**
 * Accueil.
 *
 * L'ordre des sections suit un argumentaire, et ici on vend : la promesse, la
 * question au visiteur, ce qui est à vendre, ce qui est à louer, comment ça se
 * passe, pourquoi nous faire confiance, ce que vaut chaque mention, l'appel
 * aux techniciens, et l'invitation à dire son besoin.
 *
 * Le Market vient avant le catalogue de location parce que c'est l'entrée qui
 * convertit ; le catalogue avant « comment ça marche » parce qu'on montre le
 * stock avant d'expliquer la mécanique.
 *
 * Ce qui a changé, c'est la forme. Chaque section apportait sa disposition, sa
 * gouttière, sa taille de titre et son fond : on descendait la page en
 * changeant huit fois de mise en page. Toutes passent maintenant par le même
 * vocabulaire (components/site/SiteKit) et les fonds alternent — sombre,
 * blanc, sombre, papier — sans que deux voisines se ressemblent au point de se
 * confondre ni ne s'opposent au point de casser la lecture.
 *
 * Les catégories avaient leur propre section de quatre vignettes à icône,
 * juste sous le catalogue qu'elles filtrent : elles sont devenues des
 * étiquettes dans le chapeau du catalogue, là où elles servent.
 */
export default function Home() {
  const { equipment, categories } = useStore()
  const published = equipment.filter((e) => e.status === 'PUBLISHED')

  // Ni écran de chargement ni écran d'erreur ici : la couverture et le choix
  // d'intention ne dépendent d'aucune donnée du serveur, et les faire attendre
  // — ou disparaître — pour un catalogue absent priverait le visiteur de la
  // seule chose qu'il est venu faire.

  return (
    <>
      <Hero />

      <IntentGrid />

      <MarketShowcase />

      {published.length > 0 && (
        <Section id="location" tone="muted">
          <SectionHeader
            tone="muted"
            label="À louer"
            title="Des engins inspectés, disponibles."
            text="Chaque engin du catalogue a été contrôlé sur place avant publication."
          />

          {categories.length > 0 && (
            <Reveal className="mt-8">
              <ul className="flex flex-wrap justify-center gap-2">
                {categories.map((cat) => {
                  const count = equipment.filter((e) => e.categoryId === cat.id).length
                  return (
                    <li key={cat.id}>
                      <Link
                        to={`/catalogue?categorie=${cat.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-papier-200 bg-white px-4 py-1.5 text-sm font-semibold text-acier-900 transition hover:border-btp-400 hover:text-btp-700"
                      >
                        {cat.name}
                        <span className="text-xs font-normal text-papier-600">{count}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </Reveal>
          )}

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {published.slice(0, 8).map((e, i) => (
              <Reveal key={e.id} delay={(i % 4) * 0.06}>
                <EquipmentCard
                  id={e.id}
                  name={e.name}
                  image={e.photos[0] || '/images/placeholders/equipment.svg'}
                  location={e.location}
                  price={e.pricePerDay}
                  level={e.level as 'BASIC' | 'SILVER' | 'GOLD'}
                />
              </Reveal>
            ))}
          </div>

          <SectionActions>
            <MoreLink to="/catalogue">Voir tous les équipements</MoreLink>
          </SectionActions>
        </Section>
      )}

      <HowItWorks />

      <WhyVolta />

      <VerificationLevels />

      <RecruitmentBand />

      <CtaBanner />
    </>
  )
}
