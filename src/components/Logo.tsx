import { useState } from 'react'

/**
 * La marque VOLTA.
 *
 * Le sigle était recopié dans l'en-tête, le pied de page et la coquille des
 * espaces connectés : trois copies à retoucher à chaque changement d'identité,
 * et deux d'entre elles finissaient toujours par diverger.
 *
 * Le logo dessiné est servi depuis `public/images/logo-volta.png`. Tant que ce
 * fichier n'est pas déposé, le sigle typographique tient sa place — un logo
 * manquant ne doit pas laisser un cadre brisé en haut de chaque page, et le
 * repli se déclenche aussi bien si le fichier est absent que s'il est corrompu
 * ou bloqué par le réseau.
 */

/** Emplacement du logo dessiné. Déposer le fichier suffit à l'afficher. */
const LOGO = '/images/logo-volta.png'

/** Signature par défaut, sous le nom. */
const SIGNATURE = 'by Génie Sélect Digital'

export default function Logo({
  /** Clair sur fond sombre (en-tête, pied de page), sombre sinon. */
  tone = 'dark',
  /**
   * La ligne sous le nom. Par défaut la signature de la marque ; dans les
   * espaces connectés, le nom de l'espace ; `null` pour aucune.
   */
  subtitle,
  className = '',
}: {
  tone?: 'dark' | 'light'
  subtitle?: string | null
  className?: string
}) {
  const [absent, setAbsent] = useState(false)

  const ligne = subtitle === undefined ? SIGNATURE : subtitle
  const nom = tone === 'dark' ? 'text-white' : 'text-acier-900'
  const teinteLigne = tone === 'dark' ? 'text-acier-300' : 'text-papier-600'

  // Le logo dessiné porte déjà le nom : à côté de lui, seule une précision
  // que l'image ne contient pas mérite d'être écrite — le nom de l'espace.
  const ligneAvecLogo = subtitle === undefined ? null : subtitle

  if (!absent) {
    return (
      <span className={`flex shrink-0 items-center gap-2.5 ${className}`}>
        <img
          src={LOGO}
          alt="VOLTA"
          className="h-9 w-auto"
          onError={() => setAbsent(true)}
          // Le logo est au-dessus de la ligne de flottaison : le différer
          // ferait clignoter l'en-tête au premier affichage.
          loading="eager"
        />
        {ligneAvecLogo && (
          <span className={`block text-xs leading-tight ${teinteLigne}`}>{ligneAvecLogo}</span>
        )}
      </span>
    )
  }

  return (
    <span className={`flex shrink-0 items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-btp-500 text-lg font-black text-acier-900">
        V
      </span>
      <span className="leading-none">
        <span className={`block text-lg font-black tracking-tight ${nom}`}>VOLTA</span>
        {ligne && (
          <span className={`block text-[10px] font-semibold uppercase tracking-widest ${teinteLigne}`}>
            {ligne === SIGNATURE ? (
              <>
                <span className="lowercase">by</span> Génie Sélect Digital
              </>
            ) : (
              ligne
            )}
          </span>
        )}
      </span>
    </span>
  )
}
