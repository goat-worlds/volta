import { Link } from 'react-router-dom'
import { ChevronRight, type LucideIcon } from 'lucide-react'

interface CategoryCardProps {
  id: string
  name: string
  /**
   * Le composant d'icône, non un élément déjà rendu.
   *
   * La carte acceptait auparavant l'un ou l'autre et distinguait les deux à
   * l'exécution — un détour né du passage des icônes lucide à `forwardRef`, qui
   * les rend indiscernables d'un élément pour un test naïf. Exiger le composant
   * supprime la question : c'est ce que tous les appels passent, et la carte
   * garde la main sur la taille et la couleur.
   */
  icon: LucideIcon
  count: number
}

export default function CategoryCard({ id, name, icon: Icon, count }: CategoryCardProps) {
  return (
    <Link to={`/catalogue?categorie=${id}`}>
      <div className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-yellow-400 hover:shadow-md">
        <div className="inline-flex items-center justify-center rounded-lg bg-yellow-100 p-3">
          <Icon className="h-6 w-6 text-yellow-600" />
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
