import { Link } from 'react-router-dom'
import { MapPin, Check } from 'lucide-react'

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
  GOLD: 'bg-yellow-100 text-yellow-800',
}

export default function EquipmentCard({ id, name, image, location, price, level }: EquipmentCardProps) {
  return (
    <Link to={`/equipment/${id}`}>
      <div className="group rounded-xl border border-slate-200 bg-white overflow-hidden transition hover:shadow-lg">
        <div className="relative overflow-hidden bg-slate-200 h-48">
          <img src={image} alt={name} className="h-full w-full object-cover transition group-hover:scale-105" />
          {level && (
            <div className={`absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${levelColors[level]}`}>
              <Check className="h-3 w-3" />
              {level === 'BASIC' ? 'Basique' : level === 'SILVER' ? 'Premium' : 'Prestige'}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-slate-900 group-hover:text-yellow-600">{name}</h3>

          <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-4 w-4" />
            {location}
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="text-lg font-bold text-slate-900">
              {price.toLocaleString('fr-FR')} <span className="text-sm text-slate-500">FCFA/jour</span>
            </div>
          </div>

          <button className="mt-3 w-full rounded-lg bg-yellow-50 py-2 text-sm font-semibold text-yellow-600 transition hover:bg-yellow-100">
            Voir l'équipement →
          </button>
        </div>
      </div>
    </Link>
  )
}
