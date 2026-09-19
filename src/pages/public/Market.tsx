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
  Star,
  Tag,
  Truck,
  WifiOff,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useLiveResource } from '../../store/useLiveResource'
import type { PublicListing } from '../../store/types'
import { errorMessage } from '../../store/api'
import ListingCard from '../../components/market/ListingCard'
import { fmtPrice } from '../../components/ui'

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

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ShoppingCart,
    title: 'Vous demandez une offre',
    text: 'Depuis la fiche de l’annonce, sans compte : vos coordonnées et votre besoin suffisent.',
  },
  {
    icon: FileSearch,
    title: 'Génie Sélect vérifie',
    text: 'Disponibilité réelle, état de l’équipement, documents. Rien n’est promis sur déclaration.',
  },
  {
    icon: HeartHandshake,
    title: 'Vous recevez l’offre',
    text: 'Un prix, des conditions, un délai. Vous négociez avec un interlocuteur unique.',
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

  const featured = listings.filter((l) => l.featured)
  const hasFilter = Boolean(query || category || condition || location || maxPrice)
  const cheapest = listings.length ? Math.min(...listings.map((l) => l.askingPrice)) : null
  const newCount = listings.filter((l) => l.condition === 'NEUF').length

  return (
    <div>
      {/* Bandeau : on vend. Le prix d'entrée et le nombre d'annonces sont
          les deux chiffres qu'un acheteur regarde avant de descendre. */}
      <section className="relative overflow-hidden bg-acier-900">
        <div className="btp-hazard-stripe h-2 w-full" aria-hidden />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-btp-500/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-btp-500/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-btp-300 ring-1 ring-btp-500/30">
                <Tag size={14} />
                Volta Market
              </span>
              <h1 className="mt-5 volta-display text-5xl text-white md:text-6xl">
                Des engins à vendre,
                <br />
                <span className="text-btp-400">vérifiés avant l’offre.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-acier-200">
                Chaque annonce est examinée par l’équipe VOLTA avant publication. Vous demandez une
                offre, Génie Sélect vérifie l’état et la disponibilité, puis vous répond.
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-7 flex max-w-md overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-white/10"
              >
                <div className="flex flex-1 items-center px-4">
                  <Search className="h-5 w-5 shrink-0 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Pelle, camion benne, groupe électrogène…"
                    aria-label="Rechercher une annonce"
                    className="ml-2 w-full py-3 text-sm text-acier-900 focus:outline-none"
                  />
                </div>
                <a
                  href="#annonces"
                  className="flex shrink-0 items-center bg-btp-500 px-5 text-sm font-bold text-white transition hover:bg-btp-600"
                >
                  Voir
                </a>
              </form>

              {/* L'état du stock, dit en une ligne. Trois chiffres encadrés
                  sous un slogan sont la signature de n'importe quelle page
                  d'accueil ; la phrase porte la même information et se lit. */}
              {listings.length > 0 && (
                <p className="mt-8 max-w-md border-t border-white/10 pt-6 text-sm leading-relaxed text-acier-300">
                  <span className="font-semibold text-btp-400">
                    {listings.length} {listings.length > 1 ? 'annonces' : 'annonce'} en ligne
                  </span>
                  {newCount > 0 && `, dont ${newCount} ${newCount > 1 ? 'neufs' : 'neuf'}`}
                  {cheapest != null &&
                    ` — à partir de ${Math.round(cheapest / 1_000_000)} millions de FCFA`}
                  . Toutes examinées par l’équipe avant publication.
                </p>
              )}
            </div>

            {/* La sélection de l'équipe, en grand : c'est la vitrine dans la
                vitrine. Sans sélection, la place reste au message. */}
            {featured[0] && (
              <Link
                to={inClientSpace ? `/client/market/${featured[0].id}` : `/market/${featured[0].id}`}
                className="group relative block overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
              >
                <img loading="lazy"
                  src={featured[0].photos[0] || '/images/placeholders/equipment.svg'}
                  alt={featured[0].title}
                  className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-acier-900 via-acier-900/70 to-transparent p-5 pt-16">
                  <span className="inline-flex items-center gap-1 rounded-full bg-btp-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    <Star size={11} fill="currentColor" />
                    Sélection VOLTA
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-white">{featured[0].title}</h2>
                  <p className="mt-1 text-sm text-acier-200">
                    {featured[0].location} · {fmtPrice(featured[0].askingPrice)}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Filtres, collés sous l'en-tête pour rester sous la main en défilant. */}
      <section
        id="annonces"
        className="sticky top-[64px] z-30 scroll-mt-20 border-b border-papier-200 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
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

      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="volta-display text-3xl text-acier-900 md:text-4xl">
              {hasFilter ? 'Résultats' : 'Toutes les annonces'}
            </h2>
            <p className="mt-1 text-papier-700">
              {loading
                ? 'Chargement des annonces…'
                : `${filtered.length} annonce${filtered.length > 1 ? 's' : ''} publiée${filtered.length > 1 ? 's' : ''} par l’équipe VOLTA`}
            </p>
          </div>
          {hasFilter && (
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
          )}
        </div>

        {error ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <WifiOff size={22} />
            </span>
            <p className="mt-3 font-semibold text-acier-900">La vitrine n’a pas pu être chargée.</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">{errorMessage(error)}</p>
          </div>
        ) : loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Search size={22} />
            </span>
            <p className="mt-3 font-semibold text-acier-900">
              {hasFilter ? 'Aucune annonce ne correspond.' : 'Aucune annonce en ligne pour le moment.'}
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Décrivez ce que vous cherchez : Génie Sélect le recherche pour vous.
            </p>
            <Link
              to={requestPath}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-acier-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-acier-800"
            >
              Décrire mon besoin
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}

        {/* Celui qui n'a pas trouvé n'est pas renvoyé : le formulaire libre
            est le même circuit, sans annonce de départ. */}
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Link
            to={requestPath}
            className="group flex items-start gap-4 rounded-2xl border border-papier-200 bg-white p-6 transition hover:border-btp-400 hover:shadow-lg"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-acier-900 text-btp-400 transition group-hover:bg-btp-500 group-hover:text-white">
              <Search size={20} />
            </span>
            <span>
              <span className="block font-bold text-acier-900">Vous ne trouvez pas ?</span>
              <span className="mt-1 block text-sm text-papier-700">
                Décrivez l’équipement recherché, votre budget et votre délai. Génie Sélect le
                cherche dans son réseau et vous adresse une offre.
              </span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-btp-600">
                Décrire mon besoin <ArrowRight size={15} />
              </span>
            </span>
          </Link>
          <Link
            to="/supplier/vendre"
            className="group flex items-start gap-4 rounded-2xl border border-papier-200 bg-white p-6 transition hover:border-btp-400 hover:shadow-lg"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-acier-900 text-btp-400 transition group-hover:bg-btp-500 group-hover:text-white">
              <Truck size={20} />
            </span>
            <span>
              <span className="block font-bold text-acier-900">Vous vendez un engin ?</span>
              <span className="mt-1 block text-sm text-papier-700">
                Déposez votre annonce depuis votre espace fournisseur. L’équipe VOLTA l’examine,
                la publie et la met en avant.
              </span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-btp-600">
                Mettre en vente <ArrowRight size={15} />
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* Le circuit, en quatre temps lisibles. Les dix étapes du serveur
          restent sur la fiche de suivi ; ici on rassure, on ne détaille pas. */}
      <section className="bg-papier-100 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <span className="volta-eyebrow text-btp-600">
              Comment ça marche
            </span>
            <h2 className="mt-3 volta-display text-4xl text-acier-900">
              Un achat suivi, jamais une transaction à l’aveugle.
            </h2>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border border-papier-200 bg-white p-6">
                <span className="absolute right-5 top-4 volta-display text-5xl text-btp-100">
                  0{i + 1}
                </span>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-btp-50 text-btp-600">
                  <s.icon size={20} />
                </span>
                <h3 className="mt-4 font-bold text-acier-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-papier-700">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-papier-700 ring-1 ring-slate-200">
            <BadgeCheck size={16} className="text-emerald-600" />
            Aucune commission : vous traitez avec Génie Sélect aux conditions de l’offre.
          </p>
        </div>
      </section>
    </div>
  )
}

const FILTER =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-acier-900 focus:border-btp-400 focus:outline-none focus:ring-2 focus:ring-btp-400/30'
