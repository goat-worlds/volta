import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Phone, ShoppingCart, X } from 'lucide-react'
import { apiGet, apiPost } from '../../store/api'
import type { PurchaseRequest } from '../../store/types'
import { Card, CopyRef, EmptyState, LinkButton, PageTitle, fmtPrice } from '../../components/ui'
import { PURCHASE_STAGE } from '../../lib/statuses'
import { TELEPHONE } from '../../lib/siteNav'
import { useToast } from '../../components/feedback/Toaster'

/**
 * Les deux étapes où la commande attend l'acheteur, et lui seul.
 *
 * Ailleurs, c'est VOLTA qui travaille — elle cherche la disponibilité, elle
 * chiffre. Ici le dossier ne bouge plus sans une réponse, et c'est le seul
 * moment où les deux boutons ont un sens.
 */
const A_DECIDER = new Set(['OFFER', 'NEGOTIATION'])

/**
 * Les achats du client sur Volta Market.
 *
 * Une commande n'était consultable que par sa référence, sur la page de suivi
 * publique. Un client qui en avait passé deux et perdu ses accusés n'avait plus
 * aucun moyen de retrouver ses dossiers — alors qu'ils portent son identifiant
 * et que son espace existe. Une commande appartient à qui l'a passée.
 */
export default function ClientPurchases() {
  const [rows, setRows] = useState<PurchaseRequest[] | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [encours, setEncours] = useState<string | null>(null)
  const toast = useToast()

  const charger = useCallback(
    () =>
      apiGet<PurchaseRequest[]>('/market/requests/mine')
        .then((d) => setRows(d ?? []))
        .catch((e) => setErreur(e instanceof Error ? e.message : 'Chargement impossible')),
    [],
  )

  useEffect(() => {
    void charger()
  }, [charger])

  /**
   * Accepter ou refuser la proposition.
   *
   * Le refus demande son motif, puis s'arrête si l'acheteur ferme la boîte :
   * un clic malheureux sur « Refuser » clôturait sinon une commande que rien
   * ne rouvre.
   *
   * Refusée, la commande reste affichée — clôturée, avec son montant. Elle
   * n'est pas retirée de l'espace : c'est la trace de ce qui a été proposé et
   * de ce qui a été répondu.
   */
  const repondre = async (r: PurchaseRequest, accepted: boolean) => {
    let motif = ''
    if (!accepted) {
      const saisi = window.prompt(
        `Refuser la proposition ${r.reference} ?

Indiquez brièvement pourquoi (facultatif).`,
      )
      if (saisi === null) return
      motif = saisi.trim()
    }
    setEncours(r.id)
    try {
      await apiPost(`/market/requests/${r.id}/response`, { accepted, motif })
      if (accepted) {
        toast.success('Proposition acceptée', `${r.reference} — VOLTA prépare la suite.`)
      } else {
        toast.info('Proposition refusée', `${r.reference} a été clôturée.`)
      }
      await charger()
    } catch (e) {
      toast.fromError(e)
    } finally {
      setEncours(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Mes achats"
        subtitle="Vos demandes d’achat, de l’envoi à la livraison. Elles restent ici jusqu’à leur clôture."
      />

      {/* Le numéro et la référence au même endroit : au téléphone, on cite la
          seconde, et la chercher ailleurs pendant qu'on appelle fait perdre le
          dossier à son interlocuteur. */}
      <Card className="flex flex-wrap items-center gap-3 border-btp-200 bg-btp-50 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-btp-500 text-white">
          <Phone size={18} />
        </span>
        <div className="min-w-0 text-sm">
          <div className="font-semibold text-acier-900">Une urgence sur une commande ?</div>
          <div className="text-papier-700">
            Appelez le{' '}
            <a href={TELEPHONE.lien} className="font-bold text-btp-700 hover:underline">
              {TELEPHONE.affiche}
            </a>{' '}
            en citant la référence de votre dossier.
          </div>
        </div>
      </Card>

      {erreur && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {erreur}
        </p>
      )}

      {rows === null ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Aucune commande"
          subtitle="Les engins que vous commandez sur Volta Market apparaîtront ici."
          action={<LinkButton to="/client/market">Voir Volta Market</LinkButton>}
        />
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => {
            const etape = PURCHASE_STAGE[r.status]
            return (
              <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyRef value={r.reference} />
                    {etape && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {etape.label}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Commandée le {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    {r.quantity > 1 ? ` · ${r.quantity} unités` : ''}
                  </div>
                  {r.offerAmount != null && (
                    <div className="mt-1 text-sm font-semibold text-btp-700">
                      {fmtPrice(r.offerAmount)}
                      {A_DECIDER.has(r.status) && (
                        <span className="ml-2 text-xs font-medium text-papier-600">
                          proposé par VOLTA
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {A_DECIDER.has(r.status) && r.offerAmount != null && (
                    <>
                      <button
                        type="button"
                        onClick={() => void repondre(r, true)}
                        disabled={encours === r.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-btp-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-btp-600 disabled:opacity-50"
                      >
                        <Check size={15} aria-hidden />
                        Accepter
                      </button>
                      <button
                        type="button"
                        onClick={() => void repondre(r, false)}
                        disabled={encours === r.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-papier-200 px-4 py-2 text-sm font-semibold text-acier-900 transition hover:border-red-300 hover:text-red-700 disabled:opacity-50"
                      >
                        <X size={15} aria-hidden />
                        Refuser
                      </button>
                    </>
                  )}
                  <Link
                    to={`/suivi?ref=${encodeURIComponent(r.reference)}`}
                    className="rounded-lg border border-papier-200 px-4 py-2 text-sm font-semibold text-acier-900 transition hover:border-btp-400"
                  >
                    Suivre
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
