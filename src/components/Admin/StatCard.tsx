import { isValidElement } from 'react'
import type { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: number | string
  color: 'yellow' | 'blue' | 'green' | 'red'
}

const colorClasses = {
  yellow: 'bg-yellow-100 text-yellow-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
}

/** Rend une icône qu'elle soit fournie comme élément ou comme composant. */
function renderIcon(icon: ReactNode) {
  if (icon == null || isValidElement(icon)) {
    return icon
  }
  const Component = icon as unknown as React.ComponentType<{ className?: string }>
  return <Component className="h-5 w-5" />
}

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          {/* Une icône Lucide passée sans être instanciée est un objet
              forwardRef, que React refuse de rendre. On l'instancie plutôt que
              de laisser l'appelant provoquer une erreur d'exécution. */}
          {renderIcon(icon)}
        </div>
      </div>
    </div>
  )
}
