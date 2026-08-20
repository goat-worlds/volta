import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { RiskMatrix, ProgressBar } from '../../../components/app/Shared'
import { KpiCardWithTrend, LineChartComponent, PieChartComponent } from '../../../components/app/Charts'
import { riskMatrix, complianceByReferential, activities, missions } from '../../../data/mock'

export function RssiDashboard() {
  const securityScoreData = [
    { month: 'Déc', value: 55 },
    { month: 'Jan', value: 62 },
    { month: 'Fév', value: 58 },
    { month: 'Mars', value: 68 },
    { month: 'Avr', value: 72 },
    { month: 'Mai', value: 78 },
  ]

  const riskDistribution = [
    { name: 'Critique', value: 12 },
    { name: 'Élevé', value: 31 },
    { name: 'Moyen', value: 56 },
    { name: 'Faible', value: 89 },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Bienvenue, Armand T.</h1>
          <p className="text-text-on-dark-muted">Voici la posture de sécurité globale de votre organisation.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 rounded-lg border border-border-dark text-text-on-dark hover:text-white transition">
            📅 21 mai 2025
          </button>
          <Link to="/app/rssi/parametres" className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition">
            + Nouvelle mission
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCardWithTrend value="62" label="Score de sécurité global" trend={5} unit="/100" />
        <KpiCardWithTrend value="12" label="Risques critiques" trend={3} />
        <KpiCardWithTrend value="248" label="Vulnérabilités" trend={18} />
        <KpiCardWithTrend value="78" label="Conformité globale" trend={6} unit="%" />
        <KpiCardWithTrend value="9" label="Plans d'actions en retard" trend={2} />
      </div>

      {/* Alert Banner */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-brand/40 bg-brand/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-brand mt-0.5" />
          <div>
            <p className="font-semibold text-white">Ce qui demande votre attention</p>
            <p className="text-sm text-text-on-dark-muted">3 risques critiques · 11 vulnérabilités élevées · 4 actions en retard</p>
          </div>
        </div>
        <Link to="/app/rssi/risques" className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Voir les priorités →
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartComponent data={securityScoreData} title="Évolution du score de sécurité" />
        <PieChartComponent data={riskDistribution} title="Distribution des risques par sévérité" />
      </div>

      {/* Risk Matrix and Compliance */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border-dark bg-surface-dark p-6">
          <h2 className="font-bold text-white mb-4">Cartographie des risques (MEHARI)</h2>
          <div className="flex justify-center">
            <div className="scale-75 origin-top">
              <RiskMatrix matrix={riskMatrix} dark />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border-dark bg-surface-dark p-6 space-y-6">
          <div>
            <h2 className="font-bold text-white mb-4">Conformité par référentiel</h2>
            <div className="space-y-3">
              {complianceByReferential.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-text-on-dark">{c.name}</span>
                    <span className="font-bold text-white">{c.value}%</span>
                  </div>
                  <ProgressBar value={c.value} dark />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border-dark">
            <h3 className="font-bold text-white mb-3">Activités récentes</h3>
            <ul className="space-y-2.5">
              {activities.slice(0, 3).map((a) => (
                <li key={a.title} className="text-sm flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-text-on-dark">{a.title}</span>
                    <span className="block text-xs text-text-on-dark-muted">{a.detail} · {a.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Missions Section */}
      <section className="rounded-lg border border-border-dark bg-surface-dark p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Missions / Audits en cours</h2>
          <Link to="/app/rssi/missions" className="text-sm font-semibold text-brand hover:underline">Voir toutes les missions →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-dark text-left text-xs uppercase tracking-wide text-text-on-dark-muted">
                <th className="px-4 py-3">Nom de la mission</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Avancement</th>
                <th className="px-4 py-3">Échéance</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((m) => (
                <tr key={m.id} className="border-b border-border-dark last:border-0 hover:bg-bg-dark">
                  <td className="px-4 py-3 font-semibold text-white">{m.name}</td>
                  <td className="px-4 py-3 text-text-on-dark">{m.type}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 w-24">
                      <ProgressBar value={m.progress} dark />
                      <span className="text-xs font-bold">{m.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-on-dark">{m.deadline}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${m.status === 'En cours' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                      {m.status === 'En cours' ? <Clock size={12} /> : <CheckCircle size={12} />}
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
