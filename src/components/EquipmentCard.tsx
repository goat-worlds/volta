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
  BASIC: 'bg-slate-100 text-slate-700',
  SILVER: 'bg-slate-200 text-slate-800',
  GOLD: 'bg-amber-100 text-amber-800',
}

export default function EquipmentCard({ id, name, image, location, price, level }: EquipmentCardProps) {
  // Le catalogue est monté à deux endroits : en public et dans l'espace client.
  // Pointer toujours vers /equipment ferait sortir le client de son espace au
  // premier clic — il perdrait sa barre latérale et son fil de navigation.
  const inClientSpace = useLocation().pathname.startsWith('/client')
  const href = inClientSpace ? `/client/equipment/${id}` : `/equipment/${id}`

  return (
    <Link to={href} className="group block">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg">
        <div className="relative h-48 overflow-hidden bg-slate-200">
          <img src={image} alt={name} className="h-full w-full object-cover transition group-hover:scale-105" />
          {level && (
            <div className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${levelColors[level]}`}>
              <Check className="h-3 w-3" />
              {level === 'BASIC' ? 'Basique' : level === 'SILVER' ? 'Premium' : 'Prestige'}
            </div>
          )}
          <FavoriteButton equipmentId={id} className="absolute right-3 top-3 shadow-sm" />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-slate-900 group-hover:text-amber-600">{name}</h3>

          <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-4 w-4" />
            {location}
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="text-lg font-bold text-slate-900">
              {price.toLocaleString('fr-FR')} <span className="text-sm text-slate-500">FCFA/jour</span>
            </div>
          </div>

          <span className="mt-3 block w-full rounded-lg bg-amber-50 py-2 text-center text-sm font-semibold text-amber-700 transition group-hover:bg-amber-100">
            Voir l'équipement →
          </span>
        </div>
      </div>
    </Link>
  )
}
