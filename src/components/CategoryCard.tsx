import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { isValidElement } from 'react'
import type { ReactNode } from 'react'

interface CategoryCardProps {
  id: string
  name: string
  icon: ReactNode
  count: number
}

export default function CategoryCard({ id, name, icon, count }: CategoryCardProps) {
  // Depuis lucide-react 0.460, les icônes sont des forwardRef : des objets, non
  // des fonctions. Tester typeof === 'function' les classait comme éléments
  // React et tentait de les rendre tels quels, ce que React refuse.
  //
  // Le critère fiable est l'inverse : ce qui est déjà un élément React se rend
  // directement, tout le reste est un composant à instancier.
  const IconComponent = icon as any
  const isComponent = icon != null && !isValidElement(icon)

  return (
    <Link to={`/catalogue?categorie=${id}`}>
      <div className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-yellow-400 hover:shadow-md">
        <div className="inline-flex items-center justify-center rounded-lg bg-yellow-100 p-3">
          {isComponent ? <IconComponent className="h-6 w-6 text-yellow-600" /> : icon}
        </div>
        <h3 className="mt-4 font-semibold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-500">+{count} équipements</p>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-yellow-600 transition group-hover:gap-3">
          Explorer <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  )
}
