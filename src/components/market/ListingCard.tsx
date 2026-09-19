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
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-btp-400 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btp-400 focus-visible:ring-offset-2"
    >
      <div className={`relative overflow-hidden bg-slate-200 ${compact ? 'h-40' : 'h-52'}`}>
        <img loading="lazy"
          src={photo}
          alt={listing.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
              listing.condition === 'NEUF'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/95 text-acier-900'
            }`}
          >
            {LISTING_CONDITION[listing.condition]}
          </span>
          {listing.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-btp-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              <Star size={11} fill="currentColor" />
              Sélection
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-acier-900/80 to-transparent p-3 pt-10">
          <span className="text-lg font-black text-white">{fmtPrice(listing.askingPrice)}</span>
          {listing.negotiable && (
            <span className="ml-2 text-xs font-semibold text-btp-300">à négocier</span>
          )}
        </div>
      </div>

      <div className={`flex flex-1 flex-col ${compact ? 'p-4' : 'p-5'}`}>
        <h3 className="font-bold leading-snug text-acier-900 group-hover:text-btp-700">
          {listing.title}
        </h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          {listing.brand} {listing.model}
          {listing.year ? ` · ${listing.year}` : ''}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} className="text-slate-400" />
            {listing.location}
          </span>
          {listing.hours != null && listing.hours > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock size={14} className="text-slate-400" />
              {listing.hours.toLocaleString('fr-FR')} h
            </span>
          )}
        </div>

        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-btp-600 transition group-hover:gap-2.5">
          Demander une offre
          <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  )
}
