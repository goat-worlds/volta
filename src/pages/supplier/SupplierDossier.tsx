import { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, FileText, Lock, ShieldCheck, Upload } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { apiGet, apiPost } from '../../store/api'
import { useToast } from '../../components/feedback/Toaster'
import { Button, Card, PageTitle } from '../../components/ui'
import { TextField } from '../../components/requests/fields'
import type { User } from '../../store/types'

/**
 * Le dossier d'entreprise du fournisseur.
 *
 * <h2>Pourquoi ici et non à l'inscription</h2>
 *
 * Réclamer un registre du commerce à quelqu'un qui vient d'abord voir le fait
 * partir. Il s'inscrit, il signe, il publie trois engins — et il complète le
 * jour où trois ne lui suffisent plus. C'est la mécanique des comptes de
 * paiement mobile : on travaille tout de suite à portée réduite, les pièces
 * vérifiées lèvent les plafonds.
 *
 * <h2>Déposer n'est pas être vérifié</h2>
 *
 * L'écran ne doit jamais laisser croire que le dépôt suffit. Trois états se
 * distinguent : rien de déposé, déposé et en attente, vérifié. Confondre les
 * deux derniers ferait tenter une publication qui sera refusée, et le
 * fournisseur croirait à une panne.
 */

interface Dossier {
  rccm: string
  dfe: string
  managerEmail: string
  pieceDeposee: boolean
  verifie: boolean
  enginsAuParc: number
  plafondSansPieces: number
}

interface Piece {
  name: string
  type: string
  contentBase64: string
}

export default function SupplierDossier() {
  const { currentUser, refreshMe } = useStore()
  const toast = useToast()

  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [rccm, setRccm] = useState('')
  const [dfe, setDfe] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [piece, setPiece] = useState<Piece | null>(null)
  const [pieceErreur, setPieceErreur] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const charger = useCallback(async () => {
    const d = await apiGet<Dossier>('/me/documents')
    setDossier(d)
    setRccm(d.rccm)
    setDfe(d.dfe)
    setManagerEmail(d.managerEmail)
  }, [])

  useEffect(() => {
    charger().catch((err) => toast.fromError(err, 'Dossier illisible'))
  }, [charger, toast])

  /** La pièce, lue en base64 — même format que les pièces de l'inscription. */
  const lirePiece = (fichier: File | null) => {
    setPieceErreur(null)
    if (!fichier) {
      setPiece(null)
      return
    }
    if (fichier.size > 5 * 1024 * 1024) {
      setPieceErreur('La pièce ne doit pas dépasser 5 Mo.')
      setPiece(null)
      return
    }
    const lecteur = new FileReader()
    lecteur.onerror = () => setPieceErreur('Fichier illisible. Réessayez.')
    lecteur.onload = () => {
      const brut = String(lecteur.result ?? '')
      setPiece({
        name: fichier.name,
        type: fichier.type || 'application/octet-stream',
        contentBase64: brut.slice(brut.indexOf(',') + 1),
      })
    }
    lecteur.readAsDataURL(fichier)
  }

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await apiPost<User>('/me/documents', {
        rccm,
        dfe,
        managerEmail,
        managerIdDocument: piece ?? undefined,
      })
      setPiece(null)
      await Promise.all([charger(), refreshMe()])
      toast.success(
        'Dossier transmis',
        'VOLTA vérifie vos pièces. Vous serez prévenu dès la validation.',
      )
    } catch (err) {
      toast.fromError(err, 'Dépôt impossible')
    } finally {
      setBusy(false)
    }
  }

  if (!dossier) {
    return (
      <div>
        <PageTitle title="Mon dossier d’entreprise" />
        <Card>
          <p className="text-sm text-papier-600">Chargement…</p>
        </Card>
      </div>
    )
  }

  const complet = Boolean(dossier.rccm && dossier.dfe)
  const restant = Math.max(0, dossier.plafondSansPieces - dossier.enginsAuParc)

  return (
    <div>
      <PageTitle
        title="Mon dossier d’entreprise"
        subtitle="Votre RCCM et votre DFE lèvent les limites de votre compte."
      />

      <Etat dossier={dossier} complet={complet} restant={restant} />

      <Card className="mt-5">
        <form onSubmit={envoyer} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="rccm"
              label="Numéro RCCM"
              required
              value={rccm}
              onChange={setRccm}
              placeholder="CI-ABJ-2024-B-12345"
              help="Registre du commerce et du crédit mobilier."
            />
            <TextField
              name="dfe"
              label="Déclaration fiscale d’existence (DFE)"
              required
              value={dfe}
              onChange={setDfe}
              placeholder="1234567 A"
            />
          </div>

          <TextField
            name="managerEmail"
            type="email"
            label="Email du responsable"
            value={managerEmail}
            onChange={setManagerEmail}
            help="L’adresse à laquelle VOLTA écrit pour les questions contractuelles."
          />

          <div>
            <label htmlFor="piece" className="block text-sm font-semibold text-acier-900">
              Pièce d’identité du gérant
            </label>
            <p className="mt-1 text-sm text-papier-600">
              {dossier.pieceDeposee && !piece
                ? 'Une pièce est déjà au dossier. En déposer une autre la remplace.'
                : 'Carte nationale d’identité ou passeport, 5 Mo au plus.'}
            </p>
            <input
              id="piece"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => lirePiece(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-papier-700 file:mr-3 file:rounded-lg file:border-0 file:bg-acier-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-acier-800"
            />
            {piece && (
              <p className="mt-2 flex items-center gap-2 text-sm text-btp-700">
                <FileText size={15} aria-hidden />
                {piece.name}
              </p>
            )}
            {pieceErreur && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{pieceErreur}</p>}
          </div>

          {/*
            Redéposer rouvre la vérification : le dire avant, et non après,
            évite qu'un compte validé perde ses droits sans comprendre
            pourquoi.
          */}
          {dossier.verifie && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Votre dossier est vérifié. Déposer une nouvelle pièce d’identité le remet en
              vérification, le temps que VOLTA la regarde.
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={busy || !rccm.trim() || !dfe.trim()}>
              <Upload size={15} aria-hidden className="mr-2" />
              {busy ? 'Envoi…' : complet ? 'Mettre à jour mon dossier' : 'Transmettre mon dossier'}
            </Button>
            <span className="text-sm text-papier-500">
              {currentUser?.company ?? currentUser?.name}
            </span>
          </div>
        </form>
      </Card>
    </div>
  )
}

/** Les trois états, écrits en toutes lettres — un badge seul ne dit pas ce qui est ouvert. */
function Etat({
  dossier,
  complet,
  restant,
}: {
  dossier: Dossier
  complet: boolean
  restant: number
}) {
  if (dossier.verifie) {
    return (
      <Card className="border-btp-200 bg-btp-50">
        <div className="flex items-start gap-3">
          <BadgeCheck size={20} className="mt-0.5 shrink-0 text-btp-600" aria-hidden />
          <div className="text-sm">
            <div className="font-semibold text-acier-900">Dossier vérifié</div>
            <p className="mt-1 text-papier-700">
              Vous publiez sans limite d’engins et vous vendez sur Volta Market.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (complet) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
          <div className="text-sm">
            <div className="font-semibold text-acier-900">Dossier en cours de vérification</div>
            <p className="mt-1 text-papier-700">
              VOLTA regarde vos pièces. En attendant, vous travaillez normalement dans la
              limite de {dossier.plafondSansPieces} engins — {dossier.enginsAuParc} au parc
              aujourd’hui.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-papier-200">
      <div className="flex items-start gap-3">
        <Lock size={20} className="mt-0.5 shrink-0 text-papier-500" aria-hidden />
        <div className="text-sm">
          <div className="font-semibold text-acier-900">
            {restant > 0
              ? `Encore ${restant} engin${restant > 1 ? 's' : ''} avant la limite`
              : 'Limite atteinte'}
          </div>
          <p className="mt-1 text-papier-700">
            Sans pièces vérifiées, un compte porte {dossier.plafondSansPieces} engins au parc
            et ne vend pas sur Volta Market. Vous en avez {dossier.enginsAuParc}. Déposez
            votre RCCM et votre DFE pour lever ces deux limites.
          </p>
        </div>
      </div>
    </Card>
  )
}
