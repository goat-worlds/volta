import { Link, useLocation } from 'react-router-dom'
import { MapPin, Check } from 'lucide-react'
import FavoriteButton from './FavoriteButton'

interface EquipmentCardProps {
  id: string
  name: string
  image: string
  location: string
  price: number
  level?: 'BASIC' | 'SILVER' | 'GOLD'
}

const levelColors = {
  BASIC: 'bg-papier-100 text-papier-700',
  SILVER: 'bg-papier-200 text-acier-800',
  GOLD: 'bg-btp-100 text-btp-800',
}

export default function EquipmentCard({ id, name, image, location, price, level }: EquipmentCardProps) {
  // Le catalogue est monté à deux endroits : en public et dans l'espace client.
  // Pointer toujours vers /equipment ferait sortir le client de son espace au
  // premier clic — il perdrait sa barre latérale et son fil de navigation.
  const inClientSpace = useLocation().pathname.startsWith('/client')
  const href = inClientSpace ? `/client/equipment/${id}` : `/equipment/${id}`

  return (
    <Link to={href} className="group block h-full">
      <div className="h-full overflow-hidden rounded-lg border border-papier-200 bg-white shadow-xs transition hover:border-btp-300 hover:shadow-md">
        {/* Deux cartes par ligne a toutes les largeurs : sur telephone la
            carte fait environ 170 px, sur grand ecran pres de 600. Une
            hauteur fixe serait une bande etroite d'un cote et une affiche
            de l'autre. */}
        <div className="relative h-36 overflow-hidden bg-papier-200 sm:h-52 lg:h-64">
          <img loading="lazy" src={image} alt={name} className="h-full w-full object-cover transition group-hover:scale-105" />
          {level && (
            <div className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs ${levelColors[level]}`}>
              <Check className="h-3 w-3" />
              {level === 'BASIC' ? 'Basique' : level === 'SILVER' ? 'Premium' : 'Prestige'}
            </div>
          )}
          <FavoriteButton equipmentId={id} className="absolute right-2 top-2 shadow-sm sm:right-3 sm:top-3" />
        </div>

        <div className="p-3 sm:p-4">
          {/* Deux lignes au plus : sans bride, un nom long deforme la carte
              et desaligne les prix d'une ligne a l'autre. */}
          <h3 className="line-clamp-2 text-sm font-semibold text-acier-900 transition group-hover:text-btp-700 sm:text-base">
            {name}
          </h3>

          <div className="mt-1.5 flex items-center gap-1 text-xs text-papier-600 sm:mt-2 sm:text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate">{location}</span>
          </div>

          <div className="mt-2.5 border-t border-papier-200 pt-2.5 sm:mt-3 sm:pt-3">
            <div className="text-base font-bold text-acier-900 sm:text-lg">
              {price.toLocaleString('fr-FR')}{' '}
              <span className="text-xs text-papier-600 sm:text-sm">FCFA/jour</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
