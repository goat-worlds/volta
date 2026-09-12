import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Hammer, Package, Truck, Zap } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import Hero from '../../components/Hero'
import IntentGrid from '../../components/home/IntentGrid'
import CategoryCard from '../../components/CategoryCard'
import EquipmentCard from '../../components/EquipmentCard'
import HowItWorks from '../../components/HowItWorks'
import WhyVolta from '../../components/WhyVolta'
import VerificationLevels from '../../components/VerificationLevels'
import SupplierCTA from '../../components/SupplierCTA'
import Carousel from '../../components/Carousel'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  'c-pelle': Package,
  'c-chargeuse': Truck,
  'c-camion': Truck,
  'c-grue': Zap,
  'c-compacteur': Building2,
  'c-groupe': Hammer,
}

/**
 * Accueil.
 *
 * L'ordre des sections porte la promesse : on annonce ce que fait la maison,
 * on demande ce que veut le visiteur, et seulement ensuite on montre le stock.
 * L'inverse — catalogue d'abord — ne parlait qu'à ceux qui cherchaient un engin
 * précis et laissait les sept autres parcours invisibles.
 */
export default function Home() {
  const { equipment, categories } = useStore()
  const published = equipment.filter((e) => e.status === 'PUBLISHED')

  // Ni écran de chargement ni écran d'erreur ici : le bandeau et le choix
  // d'intention ne dépendent d'aucune donnée du serveur, et les faire attendre
  // — ou disparaître — pour un catalogue absent priverait le visiteur de la
  // seule chose qu'il est venu faire.

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Hero />

        <IntentGrid />

        {published.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-acier-900 md:text-4xl">
                  Équipements disponibles
                </h2>
                <p className="mt-2 text-lg text-slate-600">
                  Des engins référencés sur Volta et contrôlés par Génie Sélect.
                </p>
              </div>
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-1 text-sm font-semibold text-btp-600 transition hover:text-btp-700"
              >
                Voir tous les équipements <ArrowRight size={15} />
              </Link>
            </div>

            {/* Le catalogue publié dépasse vite quatre engins : une grille figée
                en cachait le reste derrière un lien. Le carrousel les fait
                défiler sur place. */}
            <Carousel ariaLabel="Équipements disponibles">
              {published.slice(0, 12).map((e) => (
                <EquipmentCard
                  key={e.id}
                  id={e.id}
                  name={e.name}
                  image={e.photos[0] || '/images/placeholders/equipment.svg'}
                  location={e.location}
                  price={e.pricePerDay}
                  level={e.level as 'BASIC' | 'SILVER' | 'GOLD'}
                />
              ))}
            </Carousel>
          </section>
        )}

        {categories.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-16 md:pb-24">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-acier-900 md:text-3xl">
                Explorer par catégorie
              </h2>
              <p className="mt-2 text-slate-600">
                Pour ceux qui savent déjà quel type d’engin ils cherchent.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 4).map((cat) => (
                <CategoryCard
                  key={cat.id}
                  id={cat.id}
                  name={cat.name}
                  icon={ICON_MAP[cat.id] || Package}
                  count={equipment.filter((e) => e.categoryId === cat.id).length}
                />
              ))}
            </div>
          </section>
        )}

        <HowItWorks />

        <WhyVolta />

        <VerificationLevels />

        <SupplierCTA />
      </main>
    </div>
  )
}
