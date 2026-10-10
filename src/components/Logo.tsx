import { useState } from 'react'

/**
 * La marque VOLTA.
 *
 * Le sigle était recopié dans l'en-tête, le pied de page et la coquille des
 * espaces connectés : trois copies à retoucher à chaque changement d'identité,
 * et deux d'entre elles finissaient toujours par diverger.
 *
 * <h2>Le symbole EST le V</h2>
 *
 * Le symbole livré n'est pas un emblème abstrait posé à côté du nom : c'est la
 * lettre V, dessinée, avec une pelle logée dans sa branche droite. Il était
 * pourtant affiché devant le mot « VOLTA » écrit en entier — on lisait donc
 * « V VOLTA », la lettre deux fois, une fois dessinée et une fois composée.
 * Deux V côte à côte, c'est une faute d'orthographe sur sa propre marque.
 *
 * Le symbole prend donc la place qui est la sienne, celle de l'initiale, et la
 * typographie reprend à « OLTA ». Le mot se lit d'un seul tenant.
 *
 * <h2>Ce que cela impose</h2>
 *
 * Le glyphe est servi recadré sur son encre (`logo-volta-v.png`) : le fichier
 * d'origine porte une marge transparente qui représente plus du tiers de sa
 * largeur, et cette marge ouvrait un blanc entre le V et le O que rien dans la
 * mise en page ne pouvait refermer.
 *
 * L'alignement se fait sur la ligne de base, pas sur le centre : centrer un
 * glyphe de proportions libres à côté d'une capitale le fait flotter, haut sur
 * un mot court, bas sur un mot long. Le V descend très légèrement sous la
 * ligne, comme dans le bloc de marque d'origine.
 *
 * <h2>Lecture à voix haute</h2>
 *
 * La composition ne se lit que des yeux : un lecteur d'écran y entendrait
 * « OLTA ». Le nom complet est donc donné une fois, invisible à l'œil, et tout
 * le dessin est masqué à l'assistance.
 *
 * <h2>Repli</h2>
 *
 * Un logo manquant ne doit pas laisser un cadre brisé en haut de chaque page.
 * Le repli écrit le V en typographie, dans la couleur de la marque, et le mot
 * reste entier. Il se déclenche aussi bien si le fichier est absent que s'il
 * est corrompu ou bloqué par le réseau.
 */

/** Le V de la marque, recadré sur son encre. */
const GLYPHE = '/images/logo-volta-v.png'

/**
 * Signature par défaut, sous le nom.
 *
 * L'artwork de marque écrit « BY GÉNIE SELECT », sans « Digital » et sans
 * accent sur SELECT. On y avait ajouté « Digital » parce que c'est le pôle qui
 * édite la plateforme : exact sur le fond, mais un logo ne se complète pas à la
 * main. La signature dit donc ce que dit le logo.
 */
const SIGNATURE = 'by Génie Select'

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
    <span className={`flex shrink-0 flex-col justify-center leading-none ${className}`}>
      {/* Le nom, dit une fois, pour qui ne voit pas la composition. */}
      <span className="sr-only">VOLTA{ligne ? ` ${ligne}` : ''}</span>

      <span aria-hidden className="flex items-baseline">
        {absent ? (
          <span className="text-[26px] font-black leading-none tracking-tight text-btp-500">V</span>
        ) : (
          <img
            src={GLYPHE}
            alt=""
            /* La hauteur dépasse la capitale : le V porte une pelle dans sa
               branche, et à hauteur de capitale exacte elle devient une tache.
               Les 2 px sous la ligne de base reprennent le débord du bloc de
               marque d'origine. */
            className="h-[28px] w-auto translate-y-[1px]"
            onError={() => setAbsent(true)}
            /* Le logo est au-dessus de la ligne de flottaison : le différer
               ferait clignoter l'en-tête au premier affichage. */
            loading="eager"
          />
        )}

        {/* Le V se termine en pointe : à espacement nul, l'œil voit encore un
            blanc au milieu du mot. Le rapprochement compense la diagonale,
            comme un crénage entre deux lettres. */}
        <span className={`-ml-[0.07em] text-[26px] font-black leading-none tracking-tight ${nom}`}>
          OLTA
        </span>
      </span>

      {ligne && (
        <span
          aria-hidden
          /* Sans `whitespace-nowrap`, la signature se brise en trois lignes dès
             que la barre se charge, et le logo pousse toute la navigation.
             Elle s'aligne sur le bord gauche du V, pas sur celui du O : c'est
             le mot entier qu'elle signe.
             
             Le filet orange qui la précède est celui de l'artwork : il rattache
             la signature au mot au lieu de la laisser flotter sous lui. */
          className={`mt-1 flex items-center gap-1.5 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.18em] ${teinteLigne}`}
        >
          <span aria-hidden className="h-px w-3.5 shrink-0 bg-btp-500" />
          {ligne === SIGNATURE ? (
            <>
              <span className="lowercase">by</span> Génie Select
            </>
          ) : (
            ligne
          )}
        </span>
      )}
    </span>
  )
}
