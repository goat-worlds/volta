import { Phone } from 'lucide-react'
import { TELEPHONE } from '../lib/siteNav'

/**
 * Le seul contact qu'un écran donne : VOLTA, et la référence à citer.
 *
 * Le client et le fournisseur ne se voient pas — le serveur leur sert
 * « Client VOLTA » et « Partenaire VOLTA », sans numéro ni adresse. Les écrans
 * gardaient pourtant les colonnes « Téléphone » et « Email » de l'époque où ces
 * coordonnées étaient livrées : le fournisseur lisait un tiret, et ne savait
 * plus qui appeler. La ligne dit maintenant qui répond, et avec quelle
 * référence on est retrouvé au bout du fil.
 */
export default function ContactVolta({
  reference,
  className = '',
}: {
  reference?: string | null
  className?: string
}) {
  return (
    <p className={`flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-600 ${className}`}>
      <Phone size={13} className="shrink-0 text-btp-600" aria-hidden />
      <span>Une question ? Appelez VOLTA au</span>
      <a href={TELEPHONE.lien} className="font-semibold text-acier-900 hover:text-btp-700 hover:underline">
        {TELEPHONE.affiche}
      </a>
      {reference ? (
        <span>
          en citant <span className="font-mono font-semibold text-acier-900">{reference}</span>.
        </span>
      ) : (
        <span>en citant votre référence.</span>
      )}
    </p>
  )
}
