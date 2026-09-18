import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingCart, Star } from 'lucide-react'
import { useLiveResource } from '../../store/useLiveResource'
import type { PublicListing } from '../../store/types'
import ListingCard from '../market/ListingCard'

/**
 * Volta Market sur l'accueil.
 *
 * Ici on vend : la sélection de l'équipe VOLTA est montrée avant le catalogue
 * de location. Les annonces viennent du serveur — ce sont celles que
 * l'administration a publiées et mises en avant, pas un visuel figé.
 *
 * Sans annonce (serveur injoignable, vitrine vide), la section disparaît :
 * l'accueil ne montre pas un rayon vide.
 */
export default function MarketShowcase() {
  const { data } = useLiveResource<PublicListing[]>('/market/listings')
  const listings = data ?? []
  if (listings.length === 0) return null

  const featured = listings.filter((l) => l.featured)
  const shown = (featured.length >= 2 ? featured : listings).slice(0, 4)

  return (
    <section id="market" className="scroll-mt-16 bg-acier-900 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="volta-eyebrow text-btp-400">
              <ShoppingCart size={14} />
              Volta Market
            </span>
            <h2 className="mt-3 volta-display text-4xl text-white md:text-5xl">
              {featured.length >= 2 ? 'La sélection VOLTA à vendre.' : 'Des engins à vendre, vérifiés avant l’offre.'}
            </h2>
            <p className="mt-3 text-lg text-acier-200">
              Annonces examinées par l’équipe VOLTA. Vous demandez une offre, Génie Sélect vérifie
              l’état et la disponibilité, puis vous répond — sans commission.
            </p>
          </div>
          <Link
            to="/market"
            className="inline-flex items-center gap-2 rounded-xl bg-btp-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-btp-600"
          >
            Toutes les annonces ({listings.length})
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((l) => (
            <ListingCard key={l.id} listing={l} compact />
          ))}
        </div>

        <p className="mt-6 inline-flex items-center gap-2 text-sm text-acier-300">
          <Star size={14} className="text-btp-400" fill="currentColor" />
          « Sélection » : mise en avant décidée par l’équipe VOLTA, jamais achetée par le vendeur.
        </p>
      </div>
    </section>
  )
}
