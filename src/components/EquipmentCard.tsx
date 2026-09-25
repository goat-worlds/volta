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
        <div className="relative h-48 overflow-hidden bg-papier-200">
          <img loading="lazy" src={image} alt={name} className="h-full w-full object-cover transition group-hover:scale-105" />
          {level && (
            <div className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${levelColors[level]}`}>
              <Check className="h-3 w-3" />
              {level === 'BASIC' ? 'Basique' : level === 'SILVER' ? 'Premium' : 'Prestige'}
            </div>
          )}
          <FavoriteButton equipmentId={id} className="absolute right-3 top-3 shadow-sm" />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-acier-900 transition group-hover:text-btp-700">{name}</h3>

          <div className="mt-2 flex items-center gap-1 text-sm text-papier-600">
            <MapPin className="h-4 w-4" />
            {location}
          </div>

          <div className="mt-3 border-t border-papier-200 pt-3">
            <div className="text-lg font-bold text-acier-900">
              {price.toLocaleString('fr-FR')} <span className="text-sm text-papier-600">FCFA/jour</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
