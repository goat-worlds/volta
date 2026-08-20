import { SeverityBadge, StatusPill } from '../../../components/app/Shared'
import { vulnerabilities } from '../../../data/mock'

export function VulnerabilitesPage({ dark }: { dark?: boolean }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Liste des vulnérabilités</h1>
        <p className={`text-sm ${dark ? 'text-text-on-dark-muted' : 'text-slate-500'}`}>
          Consultez et priorisez les vulnérabilités détectées.
        </p>
      </div>
      <div className={`overflow-x-auto rounded-lg border shadow-xs ${dark ? 'border-border-dark bg-surface-dark' : 'border-slate-200 bg-white'}`}>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className={`border-b text-left text-xs uppercase tracking-wide ${dark ? 'border-border-dark text-text-on-dark-muted' : 'border-slate-200 text-slate-500'}`}>
              <th className="px-4 py-3">Constat</th>
              <th className="px-4 py-3">CVE</th>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Actif</th>
              <th className="px-4 py-3">CVSS</th>
              <th className="px-4 py-3">Criticité</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {vulnerabilities.map((v) => (
              <tr key={v.id} className={`border-b last:border-0 ${dark ? 'border-border-dark hover:bg-bg-dark' : 'border-slate-100 hover:bg-surface-light'}`}>
                <td className="px-4 py-3 font-mono text-xs font-bold text-brand">{v.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{v.cve}</td>
                <td className="px-4 py-3">{v.title}</td>
                <td className="px-4 py-3 font-mono text-xs">{v.asset}</td>
                <td className="px-4 py-3 font-bold">{v.cvss.toFixed(1)}</td>
                <td className="px-4 py-3"><SeverityBadge severity={v.severity} /></td>
                <td className="px-4 py-3"><StatusPill status={v.status} /></td>
                <td className="px-4 py-3">{v.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
