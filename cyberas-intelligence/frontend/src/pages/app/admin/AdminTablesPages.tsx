import { StatusPill } from '../../../components/app/Shared'
import { adminUsers, adminOrgs } from '../../../data/mock'

export function UtilisateursPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Utilisateurs</h1>
        <p className="text-sm text-slate-500">Gérez les utilisateurs de la plateforme.</p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Nom complet</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Dernière connexion</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr key={u.email} className="border-b border-slate-100 last:border-0 hover:bg-surface-light">
                <td className="px-4 py-3 font-semibold">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u.org}</td>
                <td className="px-4 py-3"><StatusPill status={u.status} /></td>
                <td className="px-4 py-3">{u.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function OrganisationsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Organisations</h1>
        <p className="text-sm text-slate-500">Gérez les organisations clientes.</p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Secteur</th>
              <th className="px-4 py-3">Pays</th>
              <th className="px-4 py-3">Abonnement</th>
              <th className="px-4 py-3">Expire le</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {adminOrgs.map((o) => (
              <tr key={o.name} className="border-b border-slate-100 last:border-0 hover:bg-surface-light">
                <td className="px-4 py-3 font-semibold">{o.name}</td>
                <td className="px-4 py-3">{o.sector}</td>
                <td className="px-4 py-3">{o.country}</td>
                <td className="px-4 py-3">{o.plan}</td>
                <td className="px-4 py-3">{o.expires}</td>
                <td className="px-4 py-3"><StatusPill status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
