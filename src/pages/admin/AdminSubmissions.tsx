import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Copy, Download, Inbox, KeyRound, Loader2, Paperclip } from 'lucide-react'
import { useLiveResource } from '../../store/useLiveResource'
import { useToast } from '../../components/feedback/Toaster'
import { Button, Card, EmptyState, Modal, PageTitle, StatCard } from '../../components/ui'
import RequestTimeline from '../../components/requests/RequestTimeline'
import { journeyFor } from '../../lib/journeys'
import {
  PRIORITY_LABELS,
  REQUEST_FLOW,
  requestStatusLabel,
  type RequestKind,
  type RequestStatus,
} from '../../types/domain'
import {
  advanceRequest,
  canTransition,
  downloadAttachment,
  getRequestDetail,
  scheduleMeeting,
  selectRequest,
  setOrientation,
  ORIENTATION_LABELS,
  type Orientation,
  type AdminRequestView,
  type AttachmentMeta,
  type ProvisionedAccount,
} from '../../services/requests'

/**
 * Demandes des parcours publics — vues de l'administration.
 *
 * Louer sans compte, acheter en dehors de Volta Market, chercher un
 * technicien, proposer un engin, candidater GOLD, demander un accompagnement,
 * rejoindre l'équipe technique : huit intentions, une seule console. Chaque
 * dossier arrive « Reçu » et n'avance que d'ici — c'est la première page où
 * l'équipe VOLTA voit enfin ce que le site a promis à ses visiteurs.
 */
const KIND_LABELS: Record<RequestKind, string> = {
  RENTAL: 'Location',
  PURCHASE: 'Achat',
  TECHNICIAN: 'Technicien',
  EQUIPMENT_OFFER: 'Offre d’engin',
  SUPPORT: 'Accompagnement',
  GOLD: 'Candidature GOLD',
}

/** Nom lisible de l'intention d'origine — reprend le titre du parcours qui l'a créée. */
function intentLabel(request: AdminRequestView): string {
  return journeyFor(request.intent)?.title ?? request.intent
}

/** Réponses du formulaire hors coordonnées (déjà montrées à part) et fichiers (en pièces jointes). */
function payloadEntries(request: AdminRequestView): [string, string][] {
  const journey = journeyFor(request.intent)
  const labelOf = new Map(journey?.steps.flatMap((s) => s.fields).map((f) => [f.name, f]) ?? [])
  return Object.entries(request.payload)
    .filter(([key]) => !key.startsWith('contact'))
    .filter(([key]) => labelOf.get(key)?.kind !== 'file')
    .filter(([, value]) => value)
    .map(([key, value]) => [labelOf.get(key)?.label ?? key, value.replaceAll(';', ', ')])
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active ? 'bg-acier-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  )
}

export default function AdminSubmissions() {
  const { data, loading, error, patch } = useLiveResource<AdminRequestView[]>('/admin/requests')
  const requests = useMemo(() => data ?? [], [data])
  const toast = useToast()

  const [kind, setKind] = useState<RequestKind | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const terminal = (s: RequestStatus) => s === 'DONE' || s === 'CLOSED'
    return {
      received: requests.filter((r) => r.status === 'RECEIVED').length,
      inProgress: requests.filter((r) => !terminal(r.status) && r.status !== 'RECEIVED').length,
      done: requests.filter((r) => terminal(r.status)).length,
    }
  }, [requests])

  const visible = useMemo(
    () =>
      [...requests]
        .filter((r) => kind === 'all' || r.kind === kind)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [requests, kind],
  )

  const present = new Set(requests.map((r) => r.kind))
  const open = requests.find((r) => r.id === openId) ?? null

  const onAdvanced = (updated: AdminRequestView) => {
    patch((current) => (current ?? []).map((r) => (r.id === updated.id ? updated : r)))
  }

  return (
    <div>
      <PageTitle
        title="Demandes publiques"
        subtitle="Location sans compte, achat libre, technicien, offre d’engin, GOLD, accompagnement, candidature technique."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Reçues" value={counts.received} icon={Inbox} accent="text-amber-700" />
        <StatCard label="En cours de traitement" value={counts.inProgress} icon={Loader2} />
        <StatCard label="Terminées ou clôturées" value={counts.done} icon={Inbox} accent="text-slate-600" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip active={kind === 'all'} label={`Toutes (${requests.length})`} onClick={() => setKind('all')} />
        {(Object.keys(KIND_LABELS) as RequestKind[])
          .filter((k) => present.has(k))
          .map((k) => (
            <FilterChip
              key={k}
              active={kind === k}
              label={`${KIND_LABELS[k]} (${requests.filter((r) => r.kind === k).length})`}
              onClick={() => setKind(k)}
            />
          ))}
      </div>

      {error && requests.length === 0 && !loading ? (
        <EmptyState icon={Inbox} title="Demandes indisponibles" subtitle="Le serveur a refusé la lecture des demandes." />
      ) : visible.length === 0 && !loading ? (
        <EmptyState
          title="Aucune demande dans cette vue"
          subtitle="Les formulaires publics — location, achat, candidature… — apparaîtront ici dès leur dépôt."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Nature</th>
                <th className="px-4 py-3">Objet</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Priorité</th>
                <th className="px-4 py-3">Avancement</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-acier-800">
                    {r.reference}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-acier-900">{KIND_LABELS[r.kind] ?? r.kind}</div>
                    <div className="text-xs text-slate-400">{intentLabel(r)}</div>
                  </td>
                  <td className="max-w-[16rem] px-4 py-3 text-slate-700">{r.subject}</td>
                  <td className="px-4 py-3">
                    <div>{r.contact.name}</div>
                    <div className="text-xs text-slate-400">{r.contact.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{PRIORITY_LABELS[r.priority]}</td>
                  <td className="px-4 py-3">
                    <RequestTimeline status={r.status} compact intent={r.intent} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" onClick={() => setOpenId(r.id)}>
                      Ouvrir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <RequestDetailModal
        request={open}
        onClose={() => setOpenId(null)}
        onAdvanced={(updated) => {
          onAdvanced(updated)
          toast.success('Demande mise à jour', `${updated.reference} est maintenant « ${requestStatusLabel(updated.status, updated.intent)} ».`)
        }}
        onError={(err) => toast.fromError(err)}
      />
    </div>
  )
}

/**
 * Rencontre fixée par VOLTA.
 *
 * C'est la seule information que l'administration ajoute au dossier, et la
 * seule que le candidat attend : elle part directement dans son suivi par
 * référence, sans qu'on ait à le rappeler pour la lui dicter. Vider la date
 * annule le rendez-vous — une rencontre déplacée ne doit pas laisser
 * l'ancienne visible.
 */
function MeetingBox({
  request,
  onSaved,
  onError,
}: {
  request: AdminRequestView
  onSaved: (updated: AdminRequestView) => void
  onError: (err: unknown) => void
}) {
  const [at, setAt] = useState(request.meetingAt ?? '')
  const [note, setNote] = useState(request.meetingNote ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setAt(request.meetingAt ?? '')
    setNote(request.meetingNote ?? '')
  }, [request.id, request.meetingAt, request.meetingNote])

  const save = async () => {
    setSaving(true)
    try {
      onSaved(await scheduleMeeting(request.id, at, note))
    } catch (err) {
      onError(err)
    } finally {
      setSaving(false)
    }
  }

  const field = 'w-full rounded-lg border border-slate-300 p-2 text-sm'

  return (
    <div className="rounded-xl border border-btp-200 bg-btp-50/40 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-btp-700">
        Rencontre — visible par le candidat depuis « Suivre ma demande »
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,14rem)_1fr_auto] sm:items-end">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Date et heure</label>
          <input className={field} placeholder="25 septembre 2026, 10 h" value={at} onChange={(e) => setAt(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Lieu et consignes</label>
          <input className={field} placeholder="Bureau VOLTA, Cocody. Pièce d'identité." value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? 'Enregistrement…' : request.meetingAt ? 'Mettre à jour' : 'Fixer la rencontre'}
        </Button>
      </div>
      {request.meetingAt && (
        <p className="mt-2 text-xs text-slate-500">
          Le candidat lit « {request.meetingAt} » avec sa référence. Videz la date pour annuler.
        </p>
      )}
    </div>
  )
}

/**
 * Orientation du candidat, après les rencontres.
 *
 * C'est la décision du responsable académie, et elle a une conséquence
 * mécanique : seule « Équipe technique » ouvre un compte technicien au moment
 * de la validation. Les deux autres orientations versent le candidat au réseau
 * de consultants, sans accès à l'espace technique — auparavant, tout candidat
 * validé devenait technicien, quel qu'ait été le verdict de l'entretien.
 */
function OrientationBox({
  request,
  onSaved,
  onError,
}: {
  request: AdminRequestView
  onSaved: (updated: AdminRequestView) => void
  onError: (err: unknown) => void
}) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const choose = async (orientation: Orientation | '') => {
    setBusy(orientation || 'clear')
    try {
      onSaved(await setOrientation(request.id, orientation, note))
      setNote('')
    } catch (err) {
      onError(err)
    } finally {
      setBusy(null)
    }
  }

  const current = request.orientation ?? null

  return (
    <div className="rounded-xl border border-acier-200 bg-acier-50/60 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-acier-700">
        Orientation après les rencontres — responsable académie
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(ORIENTATION_LABELS) as Orientation[]).map((key) => (
          <button
            key={key}
            type="button"
            disabled={busy !== null}
            onClick={() => void choose(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
              current === key
                ? 'bg-acier-900 text-white'
                : 'border border-slate-300 bg-white text-slate-600 hover:border-acier-500 hover:text-acier-900'
            }`}
          >
            {ORIENTATION_LABELS[key]}
          </button>
        ))}
        {current && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void choose('')}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 disabled:opacity-50"
          >
            Effacer
          </button>
        )}
      </div>
      <input
        className="mt-3 w-full rounded-lg border border-slate-300 p-2 text-sm"
        placeholder="Note d’entretien (facultative), consignée dans l’historique du dossier"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <p className="mt-2 text-xs text-slate-500">
        {current === 'TECHNICIAN'
          ? 'À la validation, un compte Équipe technique sera créé pour ce candidat.'
          : current
            ? 'Aucun compte technicien ne sera créé : ce candidat rejoint le réseau de consultants.'
            : 'Sans orientation, la validation crée un compte Équipe technique par défaut.'}
      </p>
    </div>
  )
}

function RequestDetailModal({
  request,
  onClose,
  onAdvanced,
  onError,
}: {
  request: AdminRequestView | null
  onClose: () => void
  onAdvanced: (updated: AdminRequestView) => void
  onError: (err: unknown) => void
}) {
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [target, setTarget] = useState<RequestStatus | null>(null)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [provisioned, setProvisioned] = useState<ProvisionedAccount | null>(null)

  useEffect(() => {
    setTarget(null)
    setNotes('')
    setAttachments([])
    setProvisioned(null)
    if (!request) return
    setLoadingAttachments(true)
    getRequestDetail(request.id)
      .then((detail) => setAttachments(detail.attachments))
      .catch(() => setAttachments([]))
      .finally(() => setLoadingAttachments(false))
  }, [request])

  if (!request) return null

  const allowedTargets = REQUEST_FLOW.filter(
    (status) => status !== request.status && canTransition(request.status, status),
  )
  const entries = payloadEntries(request)

  /** Le dossier est bon : il atteint l'étape où le travail commence, en un geste. */
  const retain = async () => {
    setBusy(true)
    try {
      const result = await selectRequest(request.id, 'Dossier retenu par VOLTA.')
      onAdvanced(result.request)
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  const confirm = async () => {
    if (!target) return
    setBusy(true)
    try {
      const result = await advanceRequest(request.id, target, notes.trim() || undefined)
      onAdvanced(result.request)
      setTarget(null)
      // Un compte vient d'être créé : son mot de passe ne sera plus jamais
      // visible ensuite, la fenêtre reste ouverte le temps qu'il soit relevé.
      if (result.account) {
        setProvisioned(result.account)
      } else {
        onClose()
      }
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  const download = async (a: AttachmentMeta) => {
    setDownloadingId(a.id)
    try {
      await downloadAttachment(request.id, a.id, a.originalName)
    } catch (err) {
      onError(err)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <Modal open={request !== null} onClose={() => (busy ? undefined : onClose())} title={`${request.reference} — ${request.subject}`}>
      <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Coordonnées</div>
            <div className="mt-1 text-sm text-acier-900">{request.contact.name}</div>
            {request.contact.company && <div className="text-sm text-slate-600">{request.contact.company}</div>}
            <div className="text-sm text-slate-600">{request.contact.phone}</div>
            <div className="text-sm text-slate-600">{request.contact.email}</div>
            <div className="text-sm text-slate-600">{request.contact.city || request.location || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Avancement</div>
            <div className="mt-2">
              <RequestTimeline status={request.status} intent={request.intent} />
            </div>
          </div>
        </div>

        <MeetingBox request={request} onSaved={onAdvanced} onError={onError} />
        {request.intent === 'JOIN_TECHNICAL_TEAM' && (
          <OrientationBox request={request} onSaved={onAdvanced} onError={onError} />
        )}

        {entries.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Réponses du formulaire</div>
            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
              {entries.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="text-xs font-semibold text-slate-500">{label}</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-sm text-acier-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {(loadingAttachments || attachments.length > 0) && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pièces jointes</div>
            {loadingAttachments ? (
              <p className="mt-2 text-sm text-slate-400">Chargement…</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {attachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-acier-900">
                      <Paperclip size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{a.originalName}</span>
                    </span>
                    <Button size="sm" tone="secondary" onClick={() => void download(a)} disabled={downloadingId === a.id}>
                      <Download size={13} />
                      {downloadingId === a.id ? 'Téléchargement…' : 'Télécharger'}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {request.notes && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Historique de traitement</div>
            <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {request.notes}
            </pre>
          </div>
        )}

        {provisioned ? (
          <div className="border-t border-slate-100 pt-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                <KeyRound size={15} />
                Compte équipe technique créé
              </div>
              <p className="mt-1 text-xs text-emerald-800">
                Ce mot de passe ne sera plus jamais affiché : transmettez-le au candidat par un canal
                distinct (téléphone, en main propre) avant de fermer cette fenêtre.
              </p>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2">
                  <span className="text-slate-500">Identifiant</span>
                  <span className="font-mono font-semibold text-acier-900">{provisioned.email}</span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2">
                  <span className="text-slate-500">Mot de passe</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-acier-900">{provisioned.temporaryPassword}</span>
                    <button
                      type="button"
                      onClick={() =>
                        void navigator.clipboard?.writeText(
                          `${provisioned.email} / ${provisioned.temporaryPassword}`,
                        )
                      }
                      aria-label="Copier les identifiants"
                      className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Copy size={14} />
                    </button>
                  </span>
                </div>
              </dl>
            </div>
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={onClose}>
                Terminé
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-100 pt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Faire avancer le dossier</div>

            {/* Lire un dossier et le juger bon est un seul geste. Le faire en
                trois clics fait traiter moins de dossiers, pas mieux : ce
                raccourci enchaîne les mêmes étapes, sans en sauter aucune. */}
            {REQUEST_FLOW.indexOf(request.status) < REQUEST_FLOW.indexOf('SEARCHING') && (
              <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-emerald-900">
                    Ce dossier est bon ? Retenez-le, il passe directement à «{' '}
                    {requestStatusLabel('SEARCHING', request?.intent)} ».
                  </p>
                  <Button
                    tone="success"
                    size="sm"
                    disabled={busy}
                    onClick={() => void retain()}
                  >
                    <CheckCircle2 size={14} />
                    {busy ? 'En cours…' : 'Retenir ce dossier'}
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {allowedTargets.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  tone={status === 'CLOSED' ? 'danger' : 'primary'}
                  onClick={() => setTarget(status)}
                >
                  {requestStatusLabel(status, request?.intent)}
                </Button>
              ))}
            </div>

            {target && (
              <div className="mt-3 space-y-2 rounded-lg border border-slate-200 p-3">
                <p className="text-sm text-slate-600">
                  Passage à « {requestStatusLabel(target, request?.intent)} ».
                  {target === 'CLOSED' && ' Cette action est définitive.'}
                  {target === 'VALIDATED' && request.intent === 'JOIN_TECHNICAL_TEAM' && (
                    <span className="mt-1 block font-medium text-btp-700">
                      Un compte équipe technique sera créé pour ce candidat.
                    </span>
                  )}
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Note interne (facultative)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-acier-500 focus:outline-none focus:ring-2 focus:ring-acier-200"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" tone="secondary" onClick={() => setTarget(null)} disabled={busy}>
                    Annuler
                  </Button>
                  <Button size="sm" onClick={() => void confirm()} disabled={busy}>
                    {busy ? 'Envoi…' : 'Confirmer'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
