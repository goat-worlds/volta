import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, ShoppingCart } from 'lucide-react'
import { apiGet } from '../../store/api'
import type { PurchaseRequest } from '../../store/types'
import { Card, CopyRef, EmptyState, LinkButton, PageTitle, fmtPrice } from '../../components/ui'
import { PURCHASE_STAGE } from '../../lib/statuses'
import { TELEPHONE } from '../../lib/siteNav'

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

  useEffect(() => {
    let annule = false
    apiGet<PurchaseRequest[]>('/market/requests/mine')
      .then((d) => {
        if (!annule) setRows(d ?? [])
      })
      .catch((e) => {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Chargement impossible')
      })
    return () => {
      annule = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <PageTitle
        title="Mes achats"
        subtitle="Vos commandes sur Volta Market, de l’envoi à la livraison."
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
                    </div>
                  )}
                </div>
                <Link
                  to={`/suivi?ref=${encodeURIComponent(r.reference)}`}
                  className="shrink-0 rounded-lg border border-papier-200 px-4 py-2 text-sm font-semibold text-acier-900 transition hover:border-btp-400"
                >
                  Suivre
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
