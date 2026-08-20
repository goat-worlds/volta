import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { KpiCard, ProgressBar, SeverityBadge } from '../../../components/app/Shared'
import { missions, vulnerabilities, activities } from '../../../data/mock'

export function AuditeurDashboard() {
  const critiques = vulnerabilities.filter((v) => v.severity === 'critique').length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Bonjour Armand 👋</h1>
        <p className="text-sm text-slate-500">Voici l'état de vos missions aujourd'hui.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard value={missions.length} label="Missions actives" delta="+2 ce mois" />
        <KpiCard value={critiques} label="Risques critiques" delta="+1 vs semaine dernière" />
        <KpiCard value={vulnerabilities.length} label="Vulnérabilités ouvertes" />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-brand/40 bg-brand/5 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle size={18} className="text-brand" />3 constats nécessitent votre validation
        </p>
        <Link to="/app/auditeur/vulnerabilites" className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Examiner →
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Missions actives</h2>
          <Link to="/app/auditeur/missions" className="text-sm font-semibold text-brand hover:underline">
            Voir tout →
          </Link>
        </div>
        <div className="mt-4 space-y-4">
          {missions.slice(0, 4).map((m) => (
            <Link key={m.id} to={`/app/auditeur/missions/${m.id}`} className="block rounded-md p-2 transition-colors hover:bg-surface-light">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {m.name} — {m.organization}
                </span>
                <span className="text-slate-500">Échéance {m.deadline}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <ProgressBar value={m.progress} />
                <span className="w-10 text-right text-xs font-bold">{m.progress}%</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="font-bold">Risques à traiter</h2>
          <ul className="mt-4 space-y-3">
            {vulnerabilities.slice(0, 4).map((v) => (
              <li key={v.id} className="flex items-center justify-between text-sm">
                <span className="truncate pr-3">{v.title}</span>
                <SeverityBadge severity={v.severity} />
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="font-bold">Activité récente</h2>
          <ul className="mt-4 space-y-3">
            {activities.map((a) => (
              <li key={a.title} className="text-sm">
                <span className="font-semibold">{a.title}</span>
                <span className="block text-xs text-slate-500">
                  {a.detail} · {a.time}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
