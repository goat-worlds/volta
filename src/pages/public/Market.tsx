import { useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  FileSearch,
  HeartHandshake,
  PackageCheck,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Tag,
  Truck,
  Wrench,
  Zap,
  WifiOff,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useLiveResource } from '../../store/useLiveResource'
import type { PublicListing } from '../../store/types'
import { errorMessage } from '../../store/api'
import ListingCard from '../../components/market/ListingCard'
import {
  Card,
  CardGrid,
  CardIcon,
  Reveal,
  Section,
  SectionHeader,
} from '../../components/site/SiteKit'

/**
 * Volta Market — la vitrine.
 *
 * L'adresse /market ouvrait directement un formulaire d'achat : le visiteur
 * devait décrire ce qu'il voulait sans jamais voir ce qui était à vendre. La
 * vitrine montre d'abord les annonces — publiées après examen par l'équipe
 * VOLTA, mises en avant par elle — et ne renvoie au formulaire libre que
 * celui qui n'a pas trouvé.
 *
 * Le vendeur n'apparaît nulle part : l'acheteur demande une offre, Génie
 * Sélect vérifie l'état et la disponibilité, puis fait l'offre. C'est le
 * circuit du cahier des charges, et c'est ce qui distingue le Market d'un site
 * de petites annonces.
 */

/**
 * Les trois besoins auxquels Volta Market répond.
 *
 * Chaque carte mène à la sélection correspondante plutôt qu'à une page de
 * présentation : un acheteur qui reconnaît son besoin doit voir le matériel
 * qui y répond au clic suivant, comme un rayon de boutique.
 */
const OFFERS: {
  icon: LucideIcon
  need: string
  title: string
  text: string
  cta: string
  to: string
}[] = [
  {
    icon: BadgeCheck,
    need: 'Acheter sans risque',
    title: 'Engins certifiés',
    text: 'Chaque engin est inspecté par l’équipe technique avant sa mise en vente : état, documents, conformité. Vous achetez ce qui a été vu, pas ce qui a été déclaré.',
    cta: 'Voir les engins certifiés',
    to: '/market#annonces',
  },
  {
    icon: Zap,
    need: 'Équiper un chantier vite',
    title: 'Disponibles en un temps record',
    text: 'Les engins déjà vérifiés et sur place partent sans délai de contrôle : le chantier n’attend pas la vérification, elle est faite.',
    cta: 'Voir ce qui part vite',
    to: '/market#annonces',
  },
  {
    icon: Wrench,
    need: 'Intervenir tout de suite',
    title: 'Outils de première instance',
    text: 'Le petit matériel qui débloque une panne ou tient un chantier : outillage, pièces d’usure, équipements de première intervention.',
    cta: 'Voir les outils',
    to: '/market#annonces',
  },
]

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ShoppingCart,
    title: 'Vous commandez',
    text: 'Depuis la fiche de l’annonce, sans compte : vos coordonnées et votre besoin suffisent.',
  },
  {
    icon: FileSearch,
    title: 'VOLTA vérifie',
    text: 'Disponibilité réelle, état de l’équipement, documents. Rien n’est promis sur déclaration.',
  },
  {
    icon: HeartHandshake,
    title: 'VOLTA vous rappelle',
    text: 'Un interlocuteur unique confirme le prix, les conditions et le délai.',
  },
  {
    icon: PackageCheck,
    title: 'Livraison et remise',
    text: 'La vente est suivie jusqu’à la remise des clés, avec votre référence à chaque étape.',
  },
]

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'recent'

export default function Market() {
  const { categories } = useStore()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const { data, loading, error } = useLiveResource<PublicListing[]>('/market/listings')

  const [query, setQuery] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState(params.get('categorie') ?? '')
  const [condition, setCondition] = useState('')
  const [location, setLocation] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState<Sort>('featured')

  const listings = data ?? []
  const inClientSpace = pathname.startsWith('/client')
  const requestPath = inClientSpace ? '/client/market/demande' : '/market/demande'

  const locations = useMemo(
    () => [...new Set(listings.map((l) => l.location))].sort(),
    [listings],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = listings.filter(
      (l) =>
        (!q ||
          l.title.toLowerCase().includes(q) ||
          l.brand.toLowerCase().includes(q) ||
          l.model.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)) &&
        (!category || l.categoryId === category) &&
        (!condition || l.condition === condition) &&
        (!location || l.location === location) &&
        (!maxPrice || l.askingPrice <= Number(maxPrice)),
    )
    const byRecent = (a: PublicListing, b: PublicListing) =>
      (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
    switch (sort) {
      case 'price-asc':
        return rows.sort((a, b) => a.askingPrice - b.askingPrice)
      case 'price-desc':
        return rows.sort((a, b) => b.askingPrice - a.askingPrice)
      case 'recent':
        return rows.sort(byRecent)
      default:
        return rows.sort((a, b) => Number(b.featured) - Number(a.featured) || byRecent(a, b))
    }
  }, [listings, query, category, condition, location, maxPrice, sort])

  const hasFilter = Boolean(query || category || condition || location || maxPrice)
  const cheapest = listings.length ? Math.min(...listings.map((l) => l.askingPrice)) : null
  const newCount = listings.filter((l) => l.condition === 'NEUF').length

  return (
    <div>
      {/* Bandeau : on vend. Le nombre d'annonces et le prix d'entrée sont les
          deux chiffres qu'un acheteur regarde avant de descendre — dits en une
          phrase, pas en cartouches.

          Il portait aussi un filet de sécurité, un halo ambré flouté et, sur
          la moitié droite, la première annonce mise en avant en grand. Or le
          tri par défaut place déjà la sélection en tête de la grille : la même
          annonce était montrée deux fois à deux tailles, à deux endroits. */}
      <section className="relative isolate overflow-hidden bg-acier-900 px-4 py-20 text-center sm:px-6">
        <Reveal className="mx-auto max-w-3xl">
          <span className="volta-eyebrow text-btp-400">
            <Tag size={14} />
            Volta Market
          </span>
          <h1 className="volta-display mt-4 text-5xl text-white sm:text-6xl">
            Des engins à vendre, <span className="text-btp-400">vérifiés avant la mise en vente</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-acier-200">
            Chaque annonce est examinée par l’équipe VOLTA avant publication. Vous demandez une
            offre, VOLTA vérifie l’état et la disponibilité, puis vous répond.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-lg bg-white shadow-lg"
          >
            <div className="flex flex-1 items-center px-4">
              <Search className="h-5 w-5 shrink-0 text-papier-600" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pelle, camion benne, groupe électrogène…"
                aria-label="Rechercher une annonce"
                className="ml-2 w-full py-3.5 text-sm text-acier-900 focus:outline-none"
              />
            </div>
            <a
              href="#annonces"
              className="flex shrink-0 items-center bg-btp-500 px-6 text-sm font-bold text-white transition hover:bg-btp-600"
            >
              Voir
            </a>
          </form>

          {listings.length > 0 && (
            <p className="mx-auto mt-10 max-w-2xl border-t border-white/10 pt-6 text-sm leading-relaxed text-acier-300">
              <span className="font-semibold text-btp-400">
                {listings.length} {listings.length > 1 ? 'annonces' : 'annonce'} en ligne
              </span>
              {newCount > 0 && `, dont ${newCount} ${newCount > 1 ? 'neufs' : 'neuf'}`}
              {cheapest != null &&
                ` — à partir de ${Math.round(cheapest / 1_000_000)} millions de FCFA`}
              . Toutes examinées par l’équipe avant publication.
            </p>
          )}
        </Reveal>
      </section>

      {/* Trois besoins, trois réponses.
          La page ouvrait directement sur la grille d'annonces : le visiteur
          voyait du matériel sans savoir ce que Volta Market résout pour lui.
          Chaque carte nomme un besoin, y répond, et mène à la sélection
          correspondante — comme les rayons d'une boutique. */}
      <Section tone="muted">
        <SectionHeader
          tone="muted"
          label="Vos besoins, nos réponses"
          title="Ce que Volta Market règle pour vous."
        />
        <CardGrid>
          {OFFERS.map((offer, i) => (
            <Reveal key={offer.title} delay={(i % 3) * 0.06}>
              <Link
                to={offer.to}
                className="group flex h-full flex-col rounded-lg border border-papier-200 bg-white p-6 shadow-xs transition hover:-translate-y-0.5 hover:border-btp-300 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <CardIcon icon={offer.icon} />
                  <span className="text-xs font-bold uppercase tracking-wider text-papier-600">
                    {offer.need}
                  </span>
                </div>
                <h3 className="volta-display mt-4 text-xl leading-tight text-acier-900">
                  {offer.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-papier-600">{offer.text}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-btp-600 transition group-hover:gap-3">
                  {offer.cta}
                  <ArrowRight size={15} />
                </span>
              </Link>
            </Reveal>
          ))}
        </CardGrid>
      </Section>

      {/* Filtres, collés sous l'en-tête pour rester sous la main en défilant. */}
      <section
        id="annonces"
        className="sticky top-[61px] z-30 scroll-mt-20 border-b border-papier-200 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-papier-600">
            <SlidersHorizontal size={14} />
            Filtrer
          </span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={FILTER}>
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className={FILTER}>
            <option value="">Neuf et occasion</option>
            <option value="NEUF">Neuf</option>
            <option value="OCCASION">Occasion</option>
          </select>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className={FILTER}>
            <option value="">Toutes localisations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Budget max (FCFA)"
            aria-label="Budget maximum"
            className={`${FILTER} w-40`}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Trier"
            className={`${FILTER} ml-auto`}
          >
            <option value="featured">Sélection d’abord</option>
            <option value="recent">Plus récentes</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>
      </section>

      <Section tone="light">
        <SectionHeader
          label={hasFilter ? 'Résultats' : 'La vitrine'}
          title={hasFilter ? 'Ce qui correspond à votre recherche.' : 'Toutes les annonces en ligne.'}
          text={
            loading
              ? 'Chargement des annonces…'
              : `${filtered.length} annonce${filtered.length > 1 ? 's' : ''} publiée${filtered.length > 1 ? 's' : ''} par l’équipe VOLTA.`
          }
        />

        {hasFilter && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setCategory('')
                setCondition('')
                setLocation('')
                setMaxPrice('')
              }}
              className="text-sm font-semibold text-btp-600 hover:text-btp-700"
            >
              Effacer les filtres
            </button>
          </div>
        )}

        {error ? (
          <div className="mt-12 flex flex-col items-center rounded-lg border border-dashed border-papier-300 bg-papier-50 p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-papier-600">
              <WifiOff size={22} />
            </span>
            <p className="mt-3 font-semibold text-acier-900">La vitrine n’a pas pu être chargée.</p>
            <p className="mt-1 max-w-sm text-sm text-papier-600">{errorMessage(error)}</p>
          </div>
        ) : loading ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-lg bg-papier-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-lg border border-dashed border-papier-300 bg-papier-50 p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-papier-600">
              <Search size={22} />
            </span>
            <p className="mt-3 font-semibold text-acier-900">
              {hasFilter ? 'Aucune annonce ne correspond.' : 'Aucune annonce en ligne pour le moment.'}
            </p>
            <p className="mt-1 max-w-sm text-sm text-papier-600">
              Décrivez ce que vous cherchez : VOLTA le recherche pour vous.
            </p>
            <Link
              to={requestPath}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-btp-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-btp-600"
            >
              Décrire mon besoin
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((l, i) => (
              <Reveal key={l.id} delay={(i % 4) * 0.06}>
                <ListingCard listing={l} />
              </Reveal>
            ))}
          </div>
        )}

        {/* Celui qui n'a pas trouvé n'est pas renvoyé : le formulaire libre
            est le même circuit, sans annonce de départ. */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <Reveal>
            <Link
              to={requestPath}
              className="group flex h-full gap-4 rounded-lg border border-papier-200 bg-white p-6 shadow-xs transition hover:border-btp-300 hover:shadow-md"
            >
              <CardIcon icon={Search} />
              <span>
                <span className="block font-bold text-acier-900">Vous ne trouvez pas ?</span>
                <span className="mt-1 block text-sm leading-relaxed text-papier-600">
                  Décrivez l’équipement recherché, votre budget et votre délai. VOLTA le cherche
                  dans son réseau et vous rappelle.
                </span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-btp-600 transition group-hover:gap-3">
                  Décrire mon besoin <ArrowRight size={15} />
                </span>
              </span>
            </Link>
          </Reveal>
          <Reveal delay={0.06}>
            <Link
              to="/supplier/vendre"
              className="group flex h-full gap-4 rounded-lg border border-papier-200 bg-white p-6 shadow-xs transition hover:border-btp-300 hover:shadow-md"
            >
              <CardIcon icon={Truck} />
              <span>
                <span className="block font-bold text-acier-900">Vous vendez un engin ?</span>
                <span className="mt-1 block text-sm leading-relaxed text-papier-600">
                  Déposez votre annonce depuis votre espace fournisseur. L’équipe VOLTA l’examine,
                  la publie et la met en avant.
                </span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-btp-600 transition group-hover:gap-3">
                  Mettre en vente <ArrowRight size={15} />
                </span>
              </span>
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* Le circuit, en quatre temps lisibles. Les dix étapes du serveur
          restent sur la fiche de suivi ; ici on rassure, on ne détaille pas. */}
      <Section tone="muted">
        <SectionHeader
          tone="muted"
          label="Comment ça marche"
          title="Un achat suivi, jamais une transaction à l’aveugle."
          text="Aucune commission : vous traitez avec VOLTA au prix affiché."
        />
        <CardGrid columns={4}>
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={(i % 4) * 0.06}>
              <Card tone="muted">
                <div className="flex items-center gap-3">
                  <CardIcon icon={s.icon} />
                  <span className="text-xs font-bold uppercase tracking-wider text-papier-600">
                    Étape {i + 1}
                  </span>
                </div>
                <h3 className="volta-display mt-4 text-xl leading-tight text-acier-900">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-papier-600">{s.text}</p>
              </Card>
            </Reveal>
          ))}
        </CardGrid>
      </Section>
    </div>
  )
}

const FILTER =
  'rounded-lg border border-papier-200 bg-white px-3 py-2 text-sm text-acier-900 focus:border-btp-400 focus:outline-none focus:ring-2 focus:ring-btp-400/30'
