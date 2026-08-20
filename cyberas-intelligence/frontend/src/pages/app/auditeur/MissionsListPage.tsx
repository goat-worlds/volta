import { Link } from 'react-router-dom'
import { Plus, ArrowRight, FileText, Clock } from 'lucide-react'
import { ProgressBar, StatusPill } from '../../../components/app/Shared'
import { missions } from '../../../data/mock'

export function MissionsListPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Missions d'audit</h1>
          <p className="mt-2 text-sm text-text-on-dark-muted">Suivez, gérez et remplissez les questionnaires d'audit assignés.</p>
        </div>
        <Link
          to="/app/auditeur/nouvelle-mission"
          className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition"
        >
          <Plus size={16} /> Nouvelle mission
        </Link>
      </div>

      {missions.length === 0 ? (
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-12 text-center">
          <FileText size={40} className="mx-auto text-text-on-dark-muted" />
          <p className="mt-4 text-text-on-dark-muted">Aucune mission pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {missions.map((m) => (
            <div key={m.id} className="flex flex-col rounded-lg border border-border-dark bg-surface-dark/50 p-5 hover:border-brand/50 transition">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/app/auditeur/missions/${m.id}`}
                    className="text-lg font-bold text-brand hover:underline block truncate"
                  >
                    {m.name}
                  </Link>
                  <p className="text-sm text-text-on-dark-muted mt-1">{m.organization}</p>
                </div>
                <div>
                  <StatusPill status={m.status} />
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-text-on-dark-muted">Type</p>
                    <p className="font-medium text-text-on-dark">{m.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-on-dark-muted">Échéance</p>
                    <p className="font-medium text-text-on-dark flex items-center gap-1">
                      <Clock size={14} /> {m.deadline}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-text-on-dark-muted mb-2">Avancement</p>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={m.progress} />
                    <span className="text-sm font-bold text-text-on-dark w-10">{m.progress}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-text-on-dark-muted mb-1">Périmètre</p>
                  <p className="text-sm text-text-on-dark-muted line-clamp-2">{m.perimeter}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-auto pt-3 border-t border-border-dark">
                <Link
                  to={`/app/auditeur/missions/${m.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 font-medium text-sm transition"
                >
                  <FileText size={16} /> Détails
                </Link>
                <Link
                  to={`/app/auditeur/missions/${m.id}/collecte`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-medium text-sm transition"
                >
                  Commencer <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
