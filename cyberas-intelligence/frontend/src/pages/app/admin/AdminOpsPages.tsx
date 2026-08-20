import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { StatusPill } from '../../../components/app/Shared'
import { subscriptions, auditLogs } from '../../../data/mock'

export function AbonnementsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Abonnements & Tarifs</h1>
        <p className="text-sm text-slate-500">Suivi de la facturation des organisations clientes.</p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Offre</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Cycle</th>
              <th className="px-4 py-3">Prochaine facturation</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => (
              <tr key={s.org} className="border-b border-slate-100 last:border-0 hover:bg-surface-light">
                <td className="px-4 py-3 font-semibold">{s.org}</td>
                <td className="px-4 py-3">{s.plan}</td>
                <td className="px-4 py-3 font-bold">{s.amount}</td>
                <td className="px-4 py-3">{s.cycle}</td>
                <td className="px-4 py-3">{s.nextBilling}</td>
                <td className="px-4 py-3"><StatusPill status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function LogsPage() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () =>
      auditLogs.filter(
        (l) =>
          l.user.toLowerCase().includes(query.toLowerCase()) ||
          l.action.toLowerCase().includes(query.toLowerCase()) ||
          l.target.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Journaux d'activité</h1>
        <p className="text-sm text-slate-500">Traçabilité des actions sur la plateforme.</p>
      </div>
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-3 text-slate-400" />
        <input
          className="w-full rounded-md border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-brand focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par utilisateur, action ou cible…"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Horodatage</th>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Cible</th>
              <th className="px-4 py-3">Adresse IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-surface-light">
                <td className="px-4 py-3 font-mono text-xs">{l.time}</td>
                <td className="px-4 py-3">{l.user}</td>
                <td className="px-4 py-3 font-semibold">{l.action}</td>
                <td className="px-4 py-3">{l.target}</td>
                <td className="px-4 py-3 font-mono text-xs">{l.ip}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Aucune entrée ne correspond à votre recherche.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
