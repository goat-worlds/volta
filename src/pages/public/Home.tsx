import { useStore } from '../../store/StoreContext'
import Hero from '../../components/Hero'
import CategoryCard from '../../components/CategoryCard'
import EquipmentCard from '../../components/EquipmentCard'
import HowItWorks from '../../components/HowItWorks'
import VerificationLevels from '../../components/VerificationLevels'
import SupplierCTA from '../../components/SupplierCTA'
import Carousel from '../../components/Carousel'
import { Package, Truck, Hammer, Building2, Zap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const ICON_MAP: Record<string, any> = {
  'c-pelle': Package,
  'c-chargeuse': Truck,
  'c-camion': Truck,
  'c-grue': Zap,
  'c-compacteur': Building2,
  'c-groupe': Hammer,
}

export default function Home() {
  const { equipment, categories, loading, error } = useStore()
  const published = equipment.filter((e) => e.status === 'PUBLISHED')

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error}</p></div>

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Hero />

        <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Explorer par catégorie</h2>
            <p className="mt-4 text-lg text-slate-600">Trouvez l'équipement que vous recherchez en 4 catégories.</p>
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

        {published.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-acier-900 md:text-4xl">Équipements en vedette</h2>
                <p className="mt-2 text-lg text-slate-600">Les meilleurs engins vérifiés et certifiés par VOLTA.</p>
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
            <Carousel ariaLabel="Équipements en vedette">
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

        <HowItWorks />

        <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Pourquoi choisir VOLTA ?</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-8">
              <div className="text-4xl font-bold text-yellow-600">100%</div>
              <h3 className="mt-4 font-semibold text-slate-900">Engins vérifiés</h3>
              <p className="mt-2 text-sm text-slate-600">Tous les équipements passent une inspection technique stricte.</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-8">
              <div className="text-4xl font-bold text-yellow-600">50+</div>
              <h3 className="mt-4 font-semibold text-slate-900">Fournisseurs certifiés</h3>
              <p className="mt-2 text-sm text-slate-600">Partenaires de confiance contrôlés régulièrement.</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-8">
              <div className="text-4xl font-bold text-yellow-600">24/7</div>
              <h3 className="mt-4 font-semibold text-slate-900">Support professionnel</h3>
              <p className="mt-2 text-sm text-slate-600">Assistance dédiée pour vos demandes et questions.</p>
            </div>
          </div>
        </section>

        <VerificationLevels />

        <SupplierCTA />
      </main>
    </div>
  )
}
