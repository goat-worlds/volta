import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Camera, CheckCircle2, FileText, Loader2, X } from 'lucide-react'
import { useStore, type InspectionFindings } from '../../store/StoreContext'
import { Card, EmptyState, LinkButton, PageTitle, StatusBadge } from '../../components/ui'
import { useToast } from '../../components/feedback/Toaster'
import { uploadInspectionFile } from '../../services/uploads'
import { errorMessage } from '../../store/api'
import type { CheckResult, ChecklistItem } from '../../store/types'

const RESULT_OPTIONS: { value: CheckResult; label: string; cls: string }[] = [
  { value: 'CONFORME', label: 'Conforme', cls: 'bg-emerald-600 text-white' },
  { value: 'A_SURVEILLER', label: 'À surveiller', cls: 'bg-amber-500 text-white' },
  { value: 'NON_CONFORME', label: 'Non conforme', cls: 'bg-red-600 text-white' },
]

export default function TechnicalInspection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { inspections, equipment, startInspection, updateChecklist, submitReport, updateFindings } = useStore()
  const inspection = inspections.find((i) => i.id === id)
  const eq = equipment.find((e) => e.id === inspection?.equipmentId)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(inspection?.checklist ?? [])
  const [observations, setObservations] = useState('')
  const [photos, setPhotos] = useState<string[]>(inspection?.photos ?? [])
  const [customs, setCustoms] = useState<string[]>(inspection?.customsDocuments ?? [])
  const [anomalies, setAnomalies] = useState<string[]>(inspection?.anomalies ?? [])
  const [anomalyDraft, setAnomalyDraft] = useState('')
  const [teamMobility, setTeamMobility] = useState(inspection?.teamMobility ?? '')
  const [leadTime, setLeadTime] = useState(inspection?.availabilityLeadTime ?? '')
  const [uploading, setUploading] = useState<'photos' | 'customs' | null>(null)
  const photoInput = useRef<HTMLInputElement>(null)
  const customsInput = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const [sending, setSending] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const field = 'w-full rounded-lg border border-slate-300 p-2 text-sm'
  const label = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500'

  if (!inspection || !eq) {
    return (
      <div>
        <EmptyState title="Inspection introuvable" />
        <div className="mt-4">
          <LinkButton to="/technical/missions" tone="secondary" size="sm">
            <ArrowLeft size={14} />
            Retour aux missions
          </LinkButton>
        </div>
      </div>
    )
  }

  const done = inspection.status === 'DONE'
  const filled = checklist.filter((c) => c.result !== null).length
  const complete = filled === checklist.length

  const setResult = async (index: number, result: CheckResult) => {
    const next = checklist.map((c, i) => (i === index ? { ...c, result } : c))
    const previous = checklist
    setChecklist(next)
    try {
      if (inspection.status === 'ASSIGNED') await startInspection(inspection.id)
      await updateChecklist(inspection.id, next)
      setSaveError(null)
    } catch {
      // Un contrôle noté sur le terrain qui n'atteint pas le serveur doit se
      // voir : sans ce retour, l'inspecteur croit sa saisie enregistrée et la
      // perd en quittant l'écran.
      setChecklist(previous)
      setSaveError("Ce contrôle n'a pas pu être enregistré. Vérifiez la connexion et réessayez.")
    }
  }

  const sections = [...new Set(checklist.map((c) => c.section))]

  /**
   * Enregistre les constats dès qu'ils changent.
   *
   * Une inspection se saisit sur un chantier, souvent debout : attendre un
   * bouton « enregistrer » expose à tout perdre. Chaque ajout de fichier,
   * chaque champ quitté part au serveur.
   */
  const saveFindings = async (findings: InspectionFindings) => {
    try {
      if (inspection.status === 'ASSIGNED') await startInspection(inspection.id)
      await updateFindings(inspection.id, findings)
      setSaveError(null)
    } catch (err) {
      setSaveError(errorMessage(err, "Ce constat n'a pas pu être enregistré."))
    }
  }

  const addFiles = async (files: FileList | null, kind: 'photos' | 'customs') => {
    if (!files || files.length === 0) return
    setUploading(kind)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const { url } = await uploadInspectionFile(file)
        urls.push(url)
      }
      const next = kind === 'photos' ? [...photos, ...urls] : [...customs, ...urls]
      if (kind === 'photos') setPhotos(next)
      else setCustoms(next)
      await saveFindings(kind === 'photos' ? { photos: next } : { customsDocuments: next })
    } catch (err) {
      setSaveError(errorMessage(err, "Le fichier n'a pas pu être envoyé."))
    } finally {
      setUploading(null)
      if (photoInput.current) photoInput.current.value = ''
      if (customsInput.current) customsInput.current.value = ''
    }
  }

  const removeFile = async (url: string, kind: 'photos' | 'customs') => {
    const next = (kind === 'photos' ? photos : customs).filter((x) => x !== url)
    if (kind === 'photos') setPhotos(next)
    else setCustoms(next)
    await saveFindings(kind === 'photos' ? { photos: next } : { customsDocuments: next })
  }

  const addAnomaly = async () => {
    const text = anomalyDraft.trim()
    if (!text || anomalies.includes(text)) return
    const next = [...anomalies, text]
    setAnomalies(next)
    setAnomalyDraft('')
    await saveFindings({ anomalies: next })
  }

  const removeAnomaly = async (text: string) => {
    const next = anomalies.filter((a) => a !== text)
    setAnomalies(next)
    await saveFindings({ anomalies: next })
  }

  const submit = async () => {
    setSending(true)
    try {
      await submitReport(
        inspection.id,
        observations || 'Inspection réalisée. Voir la checklist détaillée.',
        checklist,
      )
      setSaveError(null)
      toast.success('Rapport transmis', 'L’engin passe en attente de décision.')
      setTimeout(() => navigate('/technical/missions'), 1500)
    } catch (error) {
      // L'écran annonçait la soumission avant même de savoir si elle avait
      // abouti : une panne réseau effaçait une inspection entière sans un mot.
      setSaveError(
        error instanceof Error
          ? `Le rapport n'a pas été transmis : ${error.message}`
          : "Le rapport n'a pas été transmis. Réessayez.",
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <LinkButton to="/technical/missions" tone="ghost" size="sm">
        <ArrowLeft size={14} />
        Retour aux missions
      </LinkButton>
      <div className="mt-2">
        <PageTitle
          title={`Inspection — ${eq.name}`}
          subtitle={`${eq.brand} ${eq.model} · ${eq.year} · ${eq.location}`}
          actions={<StatusBadge status={eq.status} />}
        />
      </div>

      {done ? (
        <Card className="p-6">
          <div className="flex items-center gap-2 font-semibold text-emerald-700">
            <CheckCircle2 size={18} />
            Rapport déjà soumis pour cette mission.
          </div>
          <p className="mt-2 text-sm text-slate-600">L'engin est en attente de décision de l'administrateur VOLTA.</p>
        </Card>
      ) : (
        <>
          <Card className="mb-4 flex items-center justify-between p-4 text-sm">
            <span className="font-medium">Progression de la checklist</span>
            <span className="font-bold text-blue-700">{filled} / {checklist.length} contrôles</span>
          </Card>

          {sections.map((section) => (
            <Card key={section} className="mb-4 p-5">
              <h3 className="mb-3 font-bold text-slate-800">{section}</h3>
              <div className="divide-y divide-slate-100">
                {checklist.map((c, i) =>
                  c.section !== section ? null : (
                    <div key={c.label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <span className="text-sm font-medium">{c.label}</span>
                      <div className="flex gap-1.5">
                        {RESULT_OPTIONS.map((o) => (
                          <button
                            key={o.value}
                            onClick={() => setResult(i, o.value)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                              c.result === o.value ? o.cls : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Card>
          ))}

          <Card className="mb-4 grid gap-4 p-5">
            <h3 className="font-bold">Observations & preuves</h3>
            <textarea
              className={field}
              rows={3}
              placeholder="Observations générales…"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Mobilité de l'équipe mécanique</label>
                <textarea
                  className={field}
                  rows={2}
                  placeholder="Ex : mécanicien et hydraulicien sur place, véhicule atelier, intervention possible sous 2 h sur Abidjan."
                  value={teamMobility}
                  onChange={(e) => setTeamMobility(e.target.value)}
                  onBlur={() => void saveFindings({ teamMobility })}
                />
              </div>
              <div>
                <label className={label}>Délai de mise à disposition</label>
                <input
                  className={field}
                  placeholder="Ex : 3 jours ouvrés après accord"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  onBlur={() => void saveFindings({ availabilityLeadTime: leadTime })}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Ce que le fournisseur peut réellement tenir, constaté sur place.
                </p>
              </div>
            </div>

            {/* Photos de terrain : de vrais fichiers, pris devant la machine. */}
            <div>
              <label className={label}>Photos de l'engin ({photos.length})</label>
              <input
                ref={photoInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => void addFiles(e.target.files, 'photos')}
              />
              <div className="mt-1 flex flex-wrap gap-2">
                {photos.map((p) => (
                  <div key={p} className="group relative">
                    <img loading="lazy" src={p} alt="" className="h-20 w-28 rounded-lg border border-slate-200 object-cover" />
                    <button
                      type="button"
                      onClick={() => void removeFile(p, 'photos')}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-red-600"
                      aria-label="Retirer cette photo"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={uploading !== null}
                  onClick={() => photoInput.current?.click()}
                  className="flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-btp-500 hover:text-btp-600 disabled:opacity-50"
                >
                  {uploading === 'photos' ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  <span className="text-xs font-medium">{uploading === 'photos' ? 'Envoi…' : 'Ajouter'}</span>
                </button>
              </div>
            </div>

            {/* Papiers de douane : souvent des scans PDF. */}
            <div>
              <label className={label}>Papiers de douane ({customs.length})</label>
              <input
                ref={customsInput}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => void addFiles(e.target.files, 'customs')}
              />
              <p className="mb-2 text-xs text-slate-500">
                Déclaration d'importation, quittance, certificat de dédouanement. Sans ces pièces, l'engin ne
                peut ni changer de main ni franchir une frontière.
              </p>
              <ul className="mb-2 space-y-1">
                {customs.map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-sm">
                    <FileText size={14} className="shrink-0 text-slate-400" />
                    <a href={doc} target="_blank" rel="noreferrer" className="truncate text-acier-700 hover:underline">
                      {doc.split('/').pop()}
                    </a>
                    <button
                      type="button"
                      onClick={() => void removeFile(doc, 'customs')}
                      className="text-slate-400 hover:text-red-600"
                      aria-label="Retirer ce document"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={uploading !== null}
                onClick={() => customsInput.current?.click()}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
              >
                {uploading === 'customs' ? 'Envoi…' : '+ Téléverser un document'}
              </button>
            </div>

            {/* Anomalies : décrites par le technicien, jamais générées. */}
            <div>
              <label className={label}>Anomalies relevées ({anomalies.length})</label>
              <div className="flex gap-2">
                <input
                  className={field}
                  placeholder="Décrire l'anomalie constatée…"
                  value={anomalyDraft}
                  onChange={(e) => setAnomalyDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void addAnomaly()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => void addAnomaly()}
                  disabled={!anomalyDraft.trim()}
                  className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
                >
                  Ajouter
                </button>
              </div>
              {anomalies.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {anomalies.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-red-600">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span className="flex-1">{a}</span>
                      <button
                        type="button"
                        onClick={() => void removeAnomaly(a)}
                        className="text-slate-400 hover:text-red-700"
                        aria-label="Retirer cette anomalie"
                      >
                        <X size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {saveError && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <p className="text-sm font-medium text-red-700">{saveError}</p>
            </div>
          )}

          <button
            onClick={submit}
            disabled={!complete || sending}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? 'Envoi du rapport…' : complete ? 'Soumettre le rapport' : `Compléter la checklist (${filled}/${checklist.length})`}
          </button>
        </>
      )}
    </div>
  )
}
