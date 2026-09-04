import { useMemo } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, ClipboardCheck, User as UserIcon, Calendar } from 'lucide-react'
import type { ChecklistItem, CheckResult, Inspection, Report, User } from '../../store/types'

/**
 * Constats d'inspection présentés à l'administration.
 *
 * L'admin attribue le niveau commercial et décide de la publication. Il ne peut
 * le faire à partir d'une seule ligne de résumé : la décision porte sur ce que
 * le technicien a réellement constaté, point par point.
 *
 * Les points non conformes sont remontés en tête. Un défaut de sécurité noyé au
 * milieu de dix-sept lignes conformes a toutes les chances d'être manqué, et
 * c'est précisément celui qui doit peser sur la décision.
 */

interface Props {
  inspection?: Inspection
  report?: Report
  inspector?: User
}

/** Apparence de chaque résultat possible. */
const RESULTS: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  CONFORME: { label: 'Conforme', icon: CheckCircle2, className: 'text-emerald-600' },
  A_SURVEILLER: { label: 'À surveiller', icon: AlertTriangle, className: 'text-amber-600' },
  NON_CONFORME: { label: 'Non conforme', icon: XCircle, className: 'text-red-600' },
  NON_RENSEIGNE: { label: 'Non renseigné', icon: MinusCircle, className: 'text-slate-400' },
}

function resultOf(result: CheckResult) {
  return RESULTS[result ?? 'NON_RENSEIGNE'] ?? RESULTS.NON_RENSEIGNE
}

export default function InspectionReview({ inspection, report, inspector }: Props) {
  // Le rapport fige la checklist au moment de sa transmission ; l'inspection
  // porte l'état courant. On préfère le rapport quand il existe : c'est lui qui
  // fait foi pour la décision.
  const checklist: ChecklistItem[] = report?.checklist ?? inspection?.checklist ?? []

  const stats = useMemo(() => {
    const count = (r: string) => checklist.filter((c) => (c.result ?? 'NON_RENSEIGNE') === r).length
    return {
      conforme: count('CONFORME'),
      aSurveiller: count('A_SURVEILLER'),
      nonConforme: count('NON_CONFORME'),
      nonRenseigne: count('NON_RENSEIGNE'),
      total: checklist.length,
    }
  }, [checklist])

  /** Points groupés par section, les non conformes d'abord dans chacune. */
  const sections = useMemo(() => {
    const order: Record<string, number> = { NON_CONFORME: 0, A_SURVEILLER: 1, NON_RENSEIGNE: 2, CONFORME: 3 }
    const grouped = new Map<string, ChecklistItem[]>()
    checklist.forEach((item) => {
      const list = grouped.get(item.section) ?? []
      list.push(item)
      grouped.set(item.section, list)
    })
    grouped.forEach((items) =>
      items.sort((a, b) => order[a.result ?? 'NON_RENSEIGNE'] - order[b.result ?? 'NON_RENSEIGNE'])
    )
    return Array.from(grouped.entries())
  }, [checklist])

  if (!inspection && !report) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <ClipboardCheck size={22} className="mx-auto text-slate-400" />
        <p className="mt-2 text-sm font-medium text-slate-700">Aucune inspection</p>
        <p className="mt-1 text-xs text-slate-500">
          Assignez une inspection pour disposer de constats sur lesquels décider.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Qui a inspecté, et quand. */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <UserIcon size={15} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <div className="text-xs text-slate-500">Inspecteur</div>
              <div className="font-medium text-slate-900">
                {inspector?.company ?? inspector?.name ?? inspection?.technicalTeamId ?? '—'}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar size={15} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <div className="text-xs text-slate-500">Assignée le</div>
              <div className="font-medium text-slate-900">{inspection?.assignedAt ?? '—'}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ClipboardCheck size={15} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <div className="text-xs text-slate-500">Rapport transmis le</div>
              <div className="font-medium text-slate-900">{report?.submittedAt ?? 'Non transmis'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Synthèse chiffrée : ce que l'admin doit peser. */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { value: stats.conforme, label: 'Conformes', className: 'text-emerald-600' },
          { value: stats.aSurveiller, label: 'À surveiller', className: 'text-amber-600' },
          { value: stats.nonConforme, label: 'Non conformes', className: 'text-red-600' },
          { value: stats.nonRenseigne, label: 'Non renseignés', className: 'text-slate-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-3 text-center">
            <div className={`text-xl font-bold ${s.className}`}>{s.value}</div>
            <div className="mt-0.5 text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Avertissement lorsque des points restent ouverts : publier dans cet état
          reviendrait à garantir ce qui n'a pas été vérifié. */}
      {(stats.nonConforme > 0 || stats.nonRenseigne > 0) && (
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-900">
            {stats.nonConforme > 0 && (
              <>
                <strong>{stats.nonConforme} point(s) non conforme(s)</strong>
                {stats.nonRenseigne > 0 && ' et '}
              </>
            )}
            {stats.nonRenseigne > 0 && <strong>{stats.nonRenseigne} point(s) non renseigné(s)</strong>}
            {' '}— examinez ces constats avant d'attribuer un niveau ou de publier.
          </p>
        </div>
      )}

      {report?.summary && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Synthèse de l'inspecteur</div>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{report.summary}</p>
        </div>
      )}

      {inspection?.anomalies && inspection.anomalies.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="text-xs uppercase tracking-wide text-red-700">Anomalies signalées</div>
          <ul className="mt-2 space-y-1">
            {inspection.anomalies.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-900">
                <XCircle size={14} className="mt-0.5 shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Les 18 points, par section. */}
      <div className="space-y-3">
        {sections.map(([section, items]) => (
          <div key={section} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-700">{section}</span>
              <span className="text-xs text-slate-500">
                {items.filter((i) => i.result === 'CONFORME').length}/{items.length} conformes
              </span>
            </div>
            <ul className="divide-y divide-slate-100">
              {items.map((item, i) => {
                const r = resultOf(item.result)
                return (
                  <li key={`${item.label}-${i}`} className="flex items-start gap-3 px-4 py-2.5">
                    <r.icon size={15} className={`mt-0.5 shrink-0 ${r.className}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm text-slate-900">{item.label}</span>
                        <span className={`text-xs font-medium ${r.className}`}>{r.label}</span>
                      </div>
                      {item.observation && (
                        <p className="mt-1 text-xs italic text-slate-500">{item.observation}</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      {inspection?.photos && inspection.photos.length > 0 && (
        <div>
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">Preuves photographiques</div>
          <div className="flex flex-wrap gap-2">
            {inspection.photos.map((p, i) => (
              <img key={i} src={p} alt="" className="h-20 w-28 rounded border border-slate-200 object-cover" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
