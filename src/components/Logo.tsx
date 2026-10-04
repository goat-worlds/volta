import { useState } from 'react'

/**
 * La marque VOLTA.
 *
 * Le sigle était recopié dans l'en-tête, le pied de page et la coquille des
 * espaces connectés : trois copies à retoucher à chaque changement d'identité,
 * et deux d'entre elles finissaient toujours par diverger.
 *
 * <h2>Le symbole, pas le bloc</h2>
 *
 * Le fichier de marque livré est un bloc empilé : le V orange, puis VOLTA en
 * noir, puis la baseline. Il est fait pour du papier, et il ne survit pas à une
 * barre de 60 px — le mot y tombe à dix pixels de haut, et son encre noire
 * disparaît dans le bleu nuit. Posé tel quel dans l'en-tête, on ne voyait
 * qu'une tache orange suivie d'une bavure.
 *
 * On a d'abord tenté de le sauver en l'agrandissant, puis en le posant sur une
 * plaque blanche. L'agrandissement poussait la navigation à la ligne ; la
 * plaque collait un rectangle clair dans une barre sombre. Le vrai problème
 * était la composition : il fallait un logo couché, pas empilé.
 *
 * Seul le symbole est donc repris — `logo-volta-mark.png`, découpé de
 * l'artwork au-dessus du mot — et le nom est composé en typographie à côté.
 * C'est ce que montre la maquette, c'est lisible à 36 px, et la couleur du
 * texte suit le fond au lieu de le subir.
 *
 * Le repli typographique reste : un logo manquant ne doit pas laisser un cadre
 * brisé en haut de chaque page, et il se déclenche aussi bien si le fichier est
 * absent que s'il est corrompu ou bloqué par le réseau.
 */

/** Le symbole seul, découpé du bloc de marque. */
const MARQUE = '/images/logo-volta-mark.png'

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

  return (
    <span className={`flex shrink-0 items-center gap-2.5 ${className}`}>
      {absent ? (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-btp-500 text-lg font-black text-acier-900">
          V
        </span>
      ) : (
        <img
          src={MARQUE}
          // Le nom est écrit juste à côté : décrire l'image le ferait entendre
          // deux fois à un lecteur d'écran.
          alt=""
          aria-hidden
          className="h-9 w-auto"
          onError={() => setAbsent(true)}
          // Le logo est au-dessus de la ligne de flottaison : le différer
          // ferait clignoter l'en-tête au premier affichage.
          loading="eager"
        />
      )}

      <span className="leading-none">
        <span className={`block text-lg font-black tracking-tight ${nom}`}>VOLTA</span>
        {ligne && (
          <span
            // Sans `whitespace-nowrap`, la signature se brise en trois lignes
            // dès que la barre se charge, et le logo pousse toute la navigation.
            className={`block whitespace-nowrap text-[10px] font-semibold uppercase tracking-widest ${teinteLigne}`}
          >
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
