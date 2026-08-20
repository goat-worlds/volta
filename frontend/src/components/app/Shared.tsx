import type { ReactNode } from 'react'
import { severityColor } from '../../data/mock'

export function KpiCard({
  value,
  label,
  delta,
  dark,
}: {
  value: ReactNode
  label: string
  delta?: string
  dark?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-5 shadow-xs ${
        dark ? 'border-border-dark bg-surface-dark' : 'border-slate-200 bg-white'
      }`}
    >
      <p className={`text-3xl font-extrabold ${dark ? 'text-white' : 'text-text-on-light'}`}>{value}</p>
      <p className={`mt-1 text-sm ${dark ? 'text-text-on-dark-muted' : 'text-text-on-light-muted'}`}>{label}</p>
      {delta && <p className="mt-1 text-xs font-semibold text-brand">{delta}</p>}
    </div>
  )
}

export function SeverityBadge({ severity }: { severity: string }) {
  const labels: Record<string, string> = {
    'tres-eleve': 'Très élevé',
    critique: 'Critique',
    eleve: 'Élevé',
    moyen: 'Moyen',
    faible: 'Faible',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${severityColor[severity] ?? 'bg-slate-200'}`}>
      {labels[severity] ?? severity}
    </span>
  )
}

export function ProgressBar({ value, dark }: { value: number; dark?: boolean }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full ${dark ? 'bg-border-dark' : 'bg-slate-200'}`}>
      <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${value}%` }} />
    </div>
  )
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    'En cours': 'bg-blue-100 text-blue-700',
    Planifié: 'bg-slate-200 text-slate-700',
    Clôturé: 'bg-emerald-100 text-emerald-700',
    Actif: 'bg-emerald-100 text-emerald-700',
    Inactif: 'bg-slate-200 text-slate-600',
    Suspendu: 'bg-red-100 text-red-700',
    'À traiter': 'bg-red-100 text-red-700',
    'En traitement': 'bg-amber-100 text-amber-700',
    Assigné: 'bg-blue-100 text-blue-700',
    Corrigé: 'bg-emerald-100 text-emerald-700',
    Vérifié: 'bg-emerald-100 text-emerald-700',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? 'bg-slate-200 text-slate-700'}`}>
      {status}
    </span>
  )
}

export function Gauge({ value, size = 140, dark }: { value: number; size?: number; dark?: boolean }) {
  const r = 54
  const c = 2 * Math.PI * r
  const filled = (value / 100) * c
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" role="img" aria-label={`Score ${value}/100`}>
      <circle cx="64" cy="64" r={r} fill="none" stroke={dark ? '#1E293B' : '#E2E8F0'} strokeWidth="10" />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke={value >= 75 ? '#00E5A0' : value >= 50 ? '#FFB020' : '#FF3B5C'}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c - filled}`}
        transform="rotate(-90 64 64)"
      />
      <text
        x="64"
        y="70"
        textAnchor="middle"
        className="font-extrabold"
        fontSize="28"
        fill={dark ? '#FFFFFF' : '#0F172A'}
      >
        {value}
      </text>
    </svg>
  )
}

const matrixColors = ['bg-emerald-500', 'bg-lime-400', 'bg-amber-400', 'bg-orange-500', 'bg-red-600']

export function RiskMatrix({ matrix, dark }: { matrix: number[][]; dark?: boolean }) {
  const impactLabels = ['Très élevé', 'Élevé', 'Moyen', 'Faible', 'Très faible']
  const probLabels = ['Très faible', 'Faible', 'Moyenne', 'Élevée', 'Très élevée']
  return (
    <div className="text-xs">
      <div className="flex">
        <div className="flex flex-col justify-around pr-2 text-right">
          {impactLabels.map((l) => (
            <span key={l} className={`h-10 leading-10 ${dark ? 'text-text-on-dark-muted' : 'text-text-on-light-muted'}`}>
              {l}
            </span>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-5 gap-1">
          {matrix.map((row, i) =>
            row.map((count, j) => {
              const level = Math.min(4, Math.round(((5 - i) + (j + 1)) / 2.2))
              return (
                <div
                  key={`${i}-${j}`}
                  className={`flex h-10 items-center justify-center rounded font-bold text-white ${matrixColors[level]}`}
                >
                  {count > 0 ? count : ''}
                </div>
              )
            }),
          )}
        </div>
      </div>
      <div className="mt-1 flex">
        <div className="w-16" />
        <div className="grid flex-1 grid-cols-5 gap-1 text-center">
          {probLabels.map((l) => (
            <span key={l} className={dark ? 'text-text-on-dark-muted' : 'text-text-on-light-muted'}>
              {l}
            </span>
          ))}
        </div>
      </div>
      <p className={`mt-2 text-center ${dark ? 'text-text-on-dark-muted' : 'text-text-on-light-muted'}`}>
        Probabilité → / Impact ↑ (méthode MEHARI)
      </p>
    </div>
  )
}
