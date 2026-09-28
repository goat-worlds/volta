import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, Star } from 'lucide-react'
import type { PublicListing } from '../../store/types'
import { LISTING_CONDITION } from '../../lib/statuses'
import { listingPath } from '../../services/market'
import { fmtPrice } from '../ui'

/**
 * Carte d'annonce Volta Market.
 *
 * Elle vend : le prix est la première chose lue après la photo, l'état (neuf /
 * occasion) et la mise en avant se voient avant le titre. La carte de location
 * dit « FCFA/jour » ; celle-ci dit un prix ferme ou « à négocier », et rien
 * d'autre — l'offre réelle est faite par Génie Sélect après vérification.
 */
export default function ListingCard({
  listing,
  compact = false,
}: {
  listing: PublicListing
  /** Version resserrée pour les bandeaux de l'accueil. */
  compact?: boolean
}) {
  const { pathname } = useLocation()
  const photo = listing.photos[0] || '/images/placeholders/equipment.svg'

  return (
    <Link
      to={listingPath(listing.id, pathname)}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-papier-200 bg-white shadow-xs transition hover:-translate-y-0.5 hover:border-btp-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btp-400 focus-visible:ring-offset-2"
    >
      {/* Deux annonces par ligne a toutes les largeurs : l'image suit la
          carte plutot que de garder une hauteur fixe. */}
      <div className={`relative overflow-hidden bg-papier-200 ${compact ? 'h-32 sm:h-40' : 'h-36 sm:h-52 lg:h-64'}`}>
        <img loading="lazy"
          src={photo}
          alt={listing.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:px-2.5 sm:py-1 sm:text-[11px] ${
              listing.condition === 'NEUF'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/95 text-acier-900'
            }`}
          >
            {LISTING_CONDITION[listing.condition]}
          </span>
          {listing.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-btp-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:px-2.5 sm:py-1 sm:text-[11px]">
              <Star size={11} fill="currentColor" />
              Sélection
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-acier-900/80 to-transparent p-2.5 pt-10 sm:p-3">
          <span className="text-sm font-black text-white sm:text-lg">{fmtPrice(listing.askingPrice)}</span>
          {listing.negotiable && (
            <span className="ml-1.5 text-[11px] font-semibold text-btp-300 sm:ml-2 sm:text-xs">à négocier</span>
          )}
        </div>
      </div>

      <div className={`flex flex-1 flex-col ${compact ? 'p-3 sm:p-4' : 'p-3 sm:p-5'}`}>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-acier-900 group-hover:text-btp-700 sm:text-base">
          {listing.title}
        </h3>
        <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-wide text-papier-600 sm:text-xs">
          {listing.brand} {listing.model}
          {listing.year ? ` · ${listing.year}` : ''}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-papier-600 sm:mt-3 sm:gap-x-4 sm:text-sm">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} className="text-papier-600" />
            {listing.location}
          </span>
          {listing.hours != null && listing.hours > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock size={14} className="text-papier-600" />
              {listing.hours.toLocaleString('fr-FR')} h
            </span>
          )}
        </div>

        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-btp-600 transition group-hover:gap-2.5">
          Commander
          <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  )
}
