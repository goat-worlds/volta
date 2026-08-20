import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, CircleDot, Circle, ArrowRight } from 'lucide-react'
import { ProgressBar } from '../../../components/app/Shared'
import { missions, wizardSteps } from '../../../data/mock'

const requiredActions = [
  { label: '4 questions sans réponse dans le questionnaire', step: 'collecte' },
  { label: '2 documents à vérifier', step: 'collecte' },
  { label: '3 vulnérabilités critiques non traitées', step: 'analyse' },
]

export function MissionCommandCenter() {
  const { id } = useParams()
  const mission = missions.find((m) => m.id === Number(id)) ?? missions[0]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand">Command Center</p>
        <h1 className="mt-1 text-2xl font-extrabold">
          AUDIT — {mission.organization} · {mission.name}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={mission.progress} />
          <span className="text-sm font-bold">{mission.progress}%</span>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="font-bold">Les 7 étapes de la mission</h2>
        <ol className="mt-4 space-y-2">
          {wizardSteps.map((s, i) => {
            const state = i + 1 < mission.currentStep ? 'done' : i + 1 === mission.currentStep ? 'current' : 'todo'
            return (
              <li key={s.slug}>
                <Link
                  to={`/app/auditeur/missions/${mission.id}/${s.slug}`}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-surface-light ${
                    state === 'current' ? 'bg-brand/5 font-bold text-brand' : state === 'done' ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {state === 'done' ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : state === 'current' ? (
                    <CircleDot size={18} className="text-brand" />
                  ) : (
                    <Circle size={18} />
                  )}
                  Étape {i + 1}/7 — {s.label}
                  {state === 'done' && <span className="ml-auto text-xs text-emerald-600">Terminé · consulter</span>}
                  {state === 'current' && <span className="ml-auto text-xs">En cours</span>}
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="font-bold">Actions requises</h2>
          <ul className="mt-4 space-y-2.5">
            {requiredActions.map((a) => (
              <li key={a.label}>
                <Link
                  to={`/app/auditeur/missions/${mission.id}/${a.step}`}
                  className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2.5 text-sm hover:border-brand"
                >
                  {a.label} <ArrowRight size={15} className="text-brand" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col justify-between rounded-lg border border-brand/40 bg-brand/5 p-5">
          <div>
            <h2 className="font-bold">Prochaine action</h2>
            <p className="mt-2 text-sm text-slate-600">
              Compléter le questionnaire ISO 27001 — domaine A.5 Politiques de sécurité (4 questions restantes).
            </p>
          </div>
          <Link
            to={`/app/auditeur/missions/${mission.id}/${wizardSteps[mission.currentStep - 1].slug}`}
            className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Commencer <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  )
}
