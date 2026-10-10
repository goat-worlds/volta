import { BadgeCheck, Phone, ShieldCheck } from 'lucide-react'
import type { User } from '../store/types'
import { TELEPHONE } from '../lib/siteNav'

/**
 * L'interlocuteur du client sur une offre : VOLTA.
 *
 * <h2>Ce que ce bloc montrait</h2>
 *
 * La raison sociale du fournisseur, son gérant, sa ville, son téléphone et son
 * adresse. L'idée était que VOLTA met en relation sans encaisser, et que ces
 * coordonnées sont le livrable.
 *
 * Ce n'est plus le modèle. VOLTA est l'intermédiaire et se porte garante de la
 * satisfaction, de l'avancement du chantier et de la disponibilité des
 * machines — elle ne le peut que sur ce qui passe par elle. Deux parties qui
 * ont le numéro l'une de l'autre traitent dehors au premier désaccord, et la
 * garantie tombe avec le dossier qu'elle ne voit plus.
 *
 * Les identités sont donc masquées des deux côtés, et le serveur les masque
 * aussi : ce bloc n'affiche pas une information qu'il aurait choisi de taire,
 * il affiche tout ce qu'il reçoit. Le nom qui arrive est déjà « Partenaire
 * VOLTA ».
 *
 * <h2>Pourquoi un bloc, et pas rien</h2>
 *
 * Le client doit savoir qu'il y a quelqu'un en face, que ce quelqu'un a été
 * vérifié, et qui appeler si ça coince. Supprimer le bloc laisserait une offre
 * sans émetteur — ce qui inquiète plus que l'anonymat.
 */

/** Ce que le client lit en face de lui. Le fournisseur, lui, n'est pas nommé. */
export function supplierLabel(supplier: User | undefined): string {
  return supplier?.company || supplier?.name || 'Partenaire VOLTA'
}

export function SupplierIdentityCompact({
  supplier,
  className = '',
}: {
  supplier: User | undefined
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <ShieldCheck size={13} className="shrink-0 text-btp-500" />
      <span className="font-medium text-acier-900">{supplierLabel(supplier)}</span>
      <BadgeCheck size={13} className="shrink-0 text-emerald-600" aria-label="Partenaire vérifié" />
    </span>
  )
}

export default function SupplierIdentity({
  supplier,
  title = 'Votre interlocuteur',
  className = '',
}: {
  supplier: User | undefined
  title?: string
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-btp-100 text-btp-600">
          <ShieldCheck size={18} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">{title}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-acier-900">VOLTA</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
              <BadgeCheck size={10} />
              {supplierLabel(supplier)} vérifié
            </span>
          </div>
        </div>
      </div>

      {/* Ce que la garantie couvre, dit ici et pas en petits caractères : c'est
          ce qui justifie de ne pas donner le numéro d'en face. */}
      <p className="mt-3 text-xs leading-relaxed text-slate-600">
        VOLTA répond de la prestation : disponibilité de la machine, avancement du chantier,
        satisfaction. Tout passe par la plateforme — c’est ce qui nous permet de la garantir.
      </p>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <Phone size={13} className="shrink-0 text-slate-400" />
        <a
          href={TELEPHONE.lien}
          className="font-semibold text-acier-800 hover:text-btp-600 hover:underline"
        >
          {TELEPHONE.affiche}
        </a>
        <span className="text-slate-500">— en citant votre référence</span>
      </div>
    </div>
  )
}
