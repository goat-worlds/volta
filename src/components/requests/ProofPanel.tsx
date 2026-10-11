import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Download, Paperclip, Upload } from 'lucide-react'
import { apiDownload, apiGet, apiPost } from '../../store/api'
import { useToast } from '../feedback/Toaster'

/**
 * Les pièces qui ferment un dossier.
 *
 * <h2>Pourquoi l'écran dit ce qui manque</h2>
 *
 * La clôture est refusée tant qu'une pièce exigée n'est pas versée. Le
 * découvrir en butant sur le refus, après avoir cliqué « Terminer », fait
 * deviner laquelle — et déposer n'importe quoi pour voir. Le panneau l'annonce
 * donc avant : voici ce qu'il faut, voici ce qui est là.
 *
 * <h2>Qui voit quoi</h2>
 *
 * Le dépôt n'apparaît qu'à qui peut déposer — VOLTA et le prestataire
 * désigné. Le client lit la liste et télécharge : les pièces le concernent,
 * c'est sa prestation. Le serveur applique la même règle ; l'écran ne fait que
 * ne pas proposer un geste qui serait refusé.
 */

interface Piece {
  id: string
  kind: string
  label: string
  originalName: string
  size: number
  uploadedAt: string
  note: string
}

interface EtatPreuves {
  proofs: Piece[]
  missing: string[]
  missingLabels: string[]
  closable: boolean
}

/** Les types proposés au dépôt, dans l'ordre où on les produit. */
const TYPES: { valeur: string; label: string }[] = [
  { valeur: 'REPORT', label: 'Compte rendu d’intervention' },
  { valeur: 'DELIVERY_NOTE', label: 'Bon de livraison ou de restitution signé' },
  { valeur: 'ACCEPTANCE', label: 'Procès-verbal de réception' },
  { valeur: 'ATTENDANCE', label: 'Feuille de présence ou attestation' },
  { valeur: 'PHOTOS', label: 'Photographies' },
]

export default function ProofPanel({
  requestId,
  /** Faux pour le client : il lit et télécharge, il ne verse pas. */
  peutDeposer,
  onChange,
}: {
  requestId: string
  peutDeposer: boolean
  /** Prévient l'écran parent quand la clôture devient possible. */
  onChange?: (closable: boolean) => void
}) {
  const [etat, setEtat] = useState<EtatPreuves | null>(null)
  const [type, setType] = useState(TYPES[0].valeur)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const charger = useCallback(() => {
    void apiGet<EtatPreuves>(`/requests/${requestId}/proofs`)
      .then((d) => {
        setEtat(d)
        onChange?.(d.closable)
      })
      .catch(() => setEtat(null))
  }, [requestId, onChange])

  useEffect(charger, [charger])

  const deposer = async (fichier: File | null) => {
    if (!fichier) return
    if (fichier.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop lourd', 'La pièce ne doit pas dépasser 10 Mo.')
      return
    }
    setBusy(true)
    try {
      // `readAsDataURL` rend « data:<type>;base64,<contenu> » : le serveur
      // n'attend que le contenu.
      const brut = await new Promise<string>((resolve, reject) => {
        const lecteur = new FileReader()
        lecteur.onerror = () => reject(new Error('Fichier illisible'))
        lecteur.onload = () => resolve(String(lecteur.result ?? ''))
        lecteur.readAsDataURL(fichier)
      })
      const maj = await apiPost<EtatPreuves>(`/requests/${requestId}/proofs`, {
        kind: type,
        name: fichier.name,
        type: fichier.type || 'application/octet-stream',
        contentBase64: brut.slice(brut.indexOf(',') + 1),
        note: note.trim(),
      })
      setEtat(maj)
      onChange?.(maj.closable)
      setNote('')
      toast.success('Pièce versée', fichier.name)
    } catch (e) {
      toast.fromError(e)
    } finally {
      setBusy(false)
    }
  }

  const telecharger = async (p: Piece) => {
    try {
      const { blob, filename } = await apiDownload(`/requests/proofs/${p.id}/file`)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename ?? p.originalName
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      toast.fromError(e)
    }
  }

  if (!etat) return null

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Pièces du dossier
        </h4>
        {etat.closable ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={12} aria-hidden />
            Dossier complet
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <AlertTriangle size={12} aria-hidden />
            Incomplet
          </span>
        )}
      </div>

      {/* Dit avant la clôture, pas à la place du refus : c'est ce qui évite de
          déposer au hasard pour voir ce qui passe. */}
      {!etat.closable && (
        <p className="mt-2 text-sm text-amber-900">
          Pour clore ce dossier, il manque : <strong>{etat.missingLabels.join(', ')}</strong>.
        </p>
      )}

      {etat.proofs.length > 0 && (
        <ul className="mt-3 space-y-2">
          {etat.proofs.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2"
            >
              <span className="min-w-0 text-sm">
                <span className="flex items-center gap-1.5 font-medium text-acier-900">
                  <Paperclip size={13} className="shrink-0 text-slate-400" aria-hidden />
                  {p.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {p.originalName} · versée le{' '}
                  {new Date(p.uploadedAt).toLocaleDateString('fr-FR')}
                  {p.note ? ` · ${p.note}` : ''}
                </span>
              </span>
              <button
                type="button"
                onClick={() => void telecharger(p)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-acier-900 transition hover:border-btp-400"
              >
                <Download size={12} aria-hidden />
                Télécharger
              </button>
            </li>
          ))}
        </ul>
      )}

      {peutDeposer && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor={`type-${requestId}`}>
            Type de pièce
          </label>
          <select
            id={`type-${requestId}`}
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-btp-400 focus:outline-none focus:ring-2 focus:ring-btp-200"
          >
            {TYPES.map((t) => (
              <option key={t.valeur} value={t.valeur}>
                {t.label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor={`note-${requestId}`}>
            Précision
          </label>
          <input
            id={`note-${requestId}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Précision (facultative) : qui a signé, à quelle date…"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-btp-400 focus:outline-none focus:ring-2 focus:ring-btp-200"
          />

          <label
            className={`mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-acier-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-acier-800 ${
              busy ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <Upload size={14} aria-hidden />
            {busy ? 'Envoi…' : 'Verser la pièce'}
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="sr-only"
              onChange={(e) => void deposer(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="mt-1 text-xs text-slate-500">Photo ou PDF, 10 Mo maximum.</p>
        </div>
      )}
    </div>
  )
}
