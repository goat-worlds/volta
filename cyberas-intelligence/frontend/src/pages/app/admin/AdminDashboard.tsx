import { KpiCard } from '../../../components/app/Shared'
import { adminStats, systemStatus, activities } from '../../../data/mock'

export function AdminDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Tableau de bord administrateur</h1>
        <p className="text-sm text-slate-500">Vue d'ensemble de la plateforme CYBERAS Intelligence.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard value={adminStats.organizations} label="Organisations" delta="+3 ce mois" />
        <KpiCard value={adminStats.users} label="Utilisateurs" delta="+12 ce mois" />
        <KpiCard value={adminStats.auditors} label="Auditeurs" delta="+2 ce mois" />
        <KpiCard value={adminStats.missions} label="Missions d'audit" delta="+8 ce mois" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="font-bold">État du système</h2>
          <ul className="mt-4 space-y-2.5">
            {systemStatus.map((s) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span>{s.name}</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${s.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                  ● {s.ok ? 'Opérationnel' : 'Incident'}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="font-bold">Activités récentes</h2>
          <ul className="mt-4 space-y-3">
            {activities.map((a) => (
              <li key={a.title} className="text-sm">
                <span className="font-semibold">{a.title}</span>
                <span className="block text-xs text-slate-500">{a.detail} · {a.time}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard value={adminStats.revenue} label="Revenus (ce mois)" delta="+12% vs mois dernier" />
        <KpiCard value={`${adminStats.compliance}%`} label="Conformité moyenne toutes organisations" delta="+6%" />
      </div>
    </div>
  )
}
