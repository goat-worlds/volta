import { BadgeCheck, Building2, Mail, MapPin, Phone, User as UserIcon } from 'lucide-react'
import type { User } from '../store/types'

/**
 * Identité d'un fournisseur.
 *
 * VOLTA met en relation sans encaisser : une fois le devis accepté, le
 * téléphone et l'adresse du fournisseur sont le livrable. Les écrans de devis
 * n'affichaient qu'un identifiant technique — le client comparait des prix sans
 * savoir qui les proposait, puis retenait une offre sans pouvoir joindre
 * personne.
 *
 * Deux densités : `compact` pour une ligne de liste ou un en-tête de colonne,
 * `full` pour le bloc de contact qu'on lit avant de décrocher.
 */

/** Nom d'affichage : la raison sociale prime, le nom de la personne dépanne. */
export function supplierLabel(supplier: User | undefined): string {
  return supplier?.company || supplier?.name || 'Fournisseur'
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
      <Building2 size={13} className="shrink-0 text-slate-400" />
      <span className="font-medium text-acier-900">{supplierLabel(supplier)}</span>
      {supplier && (
        <BadgeCheck size={13} className="shrink-0 text-emerald-600" aria-label="Fournisseur vérifié" />
      )}
    </span>
  )
}

export default function SupplierIdentity({
  supplier,
  title = 'Fournisseur',
  /** Le contact ne s'affiche qu'une fois l'offre retenue, sauf demande explicite. */
  showContact = true,
  className = '',
}: {
  supplier: User | undefined
  title?: string
  showContact?: boolean
  className?: string
}) {
  if (!supplier) {
    // Un fournisseur non résolu ne doit pas laisser un bloc vide : le client
    // saurait au moins qu'il manque une information, plutôt que de croire
    // qu'il n'y en a pas.
    return (
      <div className={`rounded-lg border border-slate-200 bg-white p-4 ${className}`}>
        <div className="text-sm font-semibold text-acier-900">{title}</div>
        <p className="mt-1 text-xs text-slate-500">
          Coordonnées indisponibles pour le moment. Contactez VOLTA si vous devez joindre ce fournisseur.
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-acier-100 text-sm font-bold text-acier-700">
          {supplierLabel(supplier).slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">{title}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-acier-900">{supplierLabel(supplier)}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
              <BadgeCheck size={10} />
              Vérifié
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-3 space-y-1.5 text-xs">
        {supplier.name && supplier.name !== supplier.company && (
          <div className="flex items-center gap-2 text-slate-600">
            <UserIcon size={13} className="shrink-0 text-slate-400" />
            <dd>{supplier.name}</dd>
          </div>
        )}
        {supplier.city && (
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin size={13} className="shrink-0 text-slate-400" />
            <dd>{supplier.city}</dd>
          </div>
        )}
        {showContact && supplier.phone && (
          <div className="flex items-center gap-2">
            <Phone size={13} className="shrink-0 text-slate-400" />
            {/* Cliquable : la moitié des consultations se font au téléphone,
                depuis un chantier. */}
            <dd>
              <a href={`tel:${supplier.phone.replace(/\s/g, '')}`} className="font-medium text-acier-800 hover:text-btp-600 hover:underline">
                {supplier.phone}
              </a>
            </dd>
          </div>
        )}
        {showContact && supplier.email && (
          <div className="flex items-center gap-2">
            <Mail size={13} className="shrink-0 text-slate-400" />
            <dd className="min-w-0">
              <a href={`mailto:${supplier.email}`} className="block truncate font-medium text-acier-800 hover:text-btp-600 hover:underline">
                {supplier.email}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
