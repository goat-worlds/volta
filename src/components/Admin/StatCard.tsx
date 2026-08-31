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

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
