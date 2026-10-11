import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Download, FileSignature, ShieldCheck } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { Card, PageTitle } from '../../components/ui'
import { useToast } from '../../components/feedback/Toaster'
import {
  CONTRAT_FICHIER,
  CONTRAT_PREAMBULE,
  CONTRAT_SOUS_TITRE,
  CONTRAT_TEXTE,
  CONTRAT_TITRE,
  CONTRAT_VERSION,
} from '../../lib/contrat'
import ContractText from '../../components/contrat/ContractText'
import { apiPost } from '../../store/api'
import type { User } from '../../store/types'

/**
 * Le contrat de collaboration, lu et signé par l'entreprise cliente.
 *
 * <h2>Trois états, trois écrans</h2>
 *
 * À signer, en vérification, actif. Ils ne disent pas la même chose et
 * n'attendent pas la même chose : les fondre dans un seul écran avec un
 * bandeau de statut obligerait le dirigeant à chercher où il en est, au moment
 * précis où il veut savoir quand son compte s'ouvre.
 *
 * <h2>Pourquoi la signature n'ouvre rien</h2>
 *
 * Une case cochée n'est pas une entreprise. Ce qui adosse l'engagement à une
 * société réelle, c'est le registre du commerce, la déclaration fiscale et la
 * pièce du gérant — que quelqu'un doit regarder. L'attente qui suit la
 * signature n'est donc pas une lenteur administrative : c'est la vérification
 * elle-même, et l'écran le dit plutôt que de laisser croire à un retard.
 */
export default function ClientContract() {
  const { currentUser, refreshMe } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [lu, setLu] = useState(false)
  const [busy, setBusy] = useState(false)

  const signe = Boolean(currentUser?.contractAcceptedAt)
  /*
   * Le fournisseur travaille dès qu'il a signé.
   *
   * L'entreprise cliente attend en plus que VOLTA vérifie ses pièces — RCCM,
   * DFE, pièce du gérant — parce que c'est à elle qu'on confie des marchés.
   * Le fournisseur, lui, a déjà passé l'inspection de ses engins : lui
   * imposer une seconde vérification des mêmes papiers le ferait attendre
   * deux fois pour une seule entrée.
   */
  const estFournisseur = currentUser?.role === 'SUPPLIER'
  const valide = estFournisseur ? signe : Boolean(currentUser?.contractValidatedAt)

  const signer = async () => {
    setBusy(true)
    try {
      await apiPost<User>('/me/contract')
      // C'est le compte qui porte la date de signature, et c'est elle qui fait
      // basculer cet écran. `reload` ne resynchronise que les collections :
      // l'écran restait sur son état d'avant jusqu'au prochain rechargement
      // complet de la page.
      await refreshMe()
      toast.success('Contrat signé', 'VOLTA vérifie vos pièces et active votre compte.')
    } catch (e) {
      toast.fromError(e)
    } finally {
      setBusy(false)
    }
  }

  if (valide) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Contrat de collaboration"
          subtitle={estFournisseur ? 'Signé. Il ne vous sera plus redemandé.' : 'Votre compte entreprise est actif.'}
        />
        <Card className="flex flex-wrap items-center gap-4 border-emerald-200 bg-emerald-50 p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <ShieldCheck size={20} />
          </span>
          <div className="min-w-0 text-sm">
            <div className="font-semibold text-emerald-900">
              {estFournisseur ? 'Contrat signé' : 'Compte entreprise actif'}
            </div>
            <div className="text-emerald-800">
              Signé le {new Date(currentUser!.contractAcceptedAt!).toLocaleDateString('fr-FR')}
              {currentUser!.contractValidatedAt
                ? `, validé par VOLTA le ${new Date(currentUser!.contractValidatedAt).toLocaleDateString('fr-FR')}.`
                : '.'}
            </div>
          </div>
        </Card>
        <Clauses />
      </div>
    )
  }

  if (signe) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Contrat de collaboration"
          subtitle="Signé. VOLTA vérifie vos pièces."
        />
        <Card className="flex flex-wrap items-center gap-4 border-btp-200 bg-btp-50 p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-btp-500 text-white">
            <Clock size={20} />
          </span>
          <div className="min-w-0 text-sm">
            <div className="font-semibold text-acier-900">Dossier en cours de vérification</div>
            <div className="text-papier-700">
              Nous contrôlons votre RCCM, votre DFE et la pièce de votre gérant. Vos demandes et
              commandes s’ouvriront dès la validation — vous pouvez consulter le catalogue
              entre-temps.
            </div>
          </div>
        </Card>
        <Clauses />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Contrat de collaboration"
        subtitle={estFournisseur
          ? 'À lire et à signer. Une seule fois, à votre première connexion.'
          : 'À lire et à signer pour activer votre compte entreprise.'}
      />

      <Clauses />

      <Card className="p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={lu}
            onChange={(e) => setLu(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded border-papier-300 text-btp-600 focus:ring-btp-400"
          />
          <span className="text-sm leading-relaxed text-acier-900">
            J’ai lu et j’accepte les engagements ci-dessus au nom de{' '}
            <strong>{currentUser?.company || 'mon entreprise'}</strong>. Je dispose du pouvoir de
            l’engager. {estFournisseur && 'Cette signature ne vous sera plus redemandée.'}
          </span>
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!lu || busy}
            onClick={() => void signer()}
            className="inline-flex items-center gap-2 rounded-lg bg-btp-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-btp-600 disabled:opacity-50"
          >
            <FileSignature size={16} aria-hidden />
            {busy ? 'Envoi…' : 'Signer le contrat'}
          </button>
          <button
            type="button"
            onClick={() => navigate(estFournisseur ? '/supplier' : '/client')}
            className="rounded-lg border border-papier-200 px-5 py-2.5 text-sm font-semibold text-acier-900 transition hover:border-papier-300"
          >
            Plus tard
          </button>
        </div>

        {/* La version est dite : c'est ce que la signature enregistre, et c'est
            ce qu'on citera le jour où une clause change. */}
        <p className="mt-3 text-xs text-papier-600">Version {CONTRAT_VERSION}.</p>
      </Card>
    </div>
  )
}

/**
 * Le texte lui-même, identique dans les trois états de l'écran.
 *
 * Dans un cadre à défilement propre : vingt articles poussés dans le flux de
 * la page feraient disparaître la case d'acceptation et le bouton à deux
 * écrans sous le pli. Ici le document se lit où il est, et ce qu'on attend du
 * lecteur reste sous les yeux.
 *
 * Le téléchargement rend le fichier source, pas une reconstitution : c'est le
 * même texte que celui affiché, et il ne peut donc pas en différer.
 */
function Clauses() {
  const telecharger = () => {
    const fichier = new Blob([CONTRAT_TEXTE], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(fichier)
    const a = document.createElement('a')
    a.href = url
    a.download = CONTRAT_FICHIER
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="volta-display text-xl text-acier-900">{CONTRAT_TITRE}</h2>
          <p className="mt-1 text-sm text-papier-600">{CONTRAT_SOUS_TITRE}</p>
          <p className="mt-1 text-xs text-papier-500">Version {CONTRAT_VERSION}</p>
        </div>
        <button
          type="button"
          onClick={telecharger}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-papier-200 px-4 py-2 text-sm font-semibold text-acier-900 transition hover:border-btp-400"
        >
          <Download size={15} aria-hidden />
          Télécharger
        </button>
      </div>

      <p className="mt-4 rounded-lg bg-papier-50 px-4 py-3 text-sm leading-relaxed text-papier-700">
        {CONTRAT_PREAMBULE}
      </p>

      <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-lg border border-papier-200 p-4 sm:p-5">
        <ContractText source={CONTRAT_TEXTE} />
      </div>
    </Card>
  )
}
