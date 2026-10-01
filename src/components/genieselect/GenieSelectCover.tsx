import { PROMESSES } from '../../lib/genieSelect'
import { Reveal } from '../site/SiteKit'

/**
 * La couverture du groupe.
 *
 * VOLTA se présentait comme une plateforme de location. Elle est la vitrine
 * numérique d'un groupe qui loue, construit, entretient, vend, suit les
 * flottes et forme les équipes — et le visiteur ne pouvait pas le deviner.
 *
 * <h2>Pourquoi un fond clair</h2>
 *
 * Elle a d'abord été sombre, comme l'en-tête qu'elle prolonge. La maquette la
 * veut claire : le titre y est bleu nuit sur un ciel pâle, et la photo se fond
 * dans ce ciel plutôt que d'être posée dessus. C'est ce qui laisse la machine
 * sortir du cadre à droite sans qu'une arête vienne la trancher.
 *
 * Le dégradé part donc du clair à gauche vers la transparence à droite —
 * l'inverse d'un voile sombre. Sans lui, le titre passerait sur la pelle et
 * deviendrait illisible dès que la fenêtre se resserre.
 *
 * <h2>Ce qui n'y est pas</h2>
 *
 * Une recherche d'engin y a figuré, héritée de l'ancienne couverture. La
 * maquette n'en veut pas : cette couverture présente le groupe, et « Louer un
 * engin » est dans la barre, à deux pas. Deux champs de recherche sur un même
 * écran se font concurrence.
 */
export default function GenieSelectCover({
  /** L'accroche manuscrite, à droite. Encombrante là où la place manque. */
  note = true,
}: {
  note?: boolean
}) {
  return (
    <section className="relative isolate overflow-hidden bg-acier-50">
      <img
        src="/engins/pelle-cat-6015b.jpeg"
        alt=""
        aria-hidden
        className="absolute inset-y-0 right-0 -z-20 h-full w-full object-cover object-right lg:w-3/5"
      />
      {/* Le clair couvre la colonne de texte et se relâche vers la droite :
          la photo reste entière, le titre reste lisible. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-acier-50 via-acier-50/95 to-acier-50/10"
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_1fr]">
          <Reveal>
            <span className="volta-eyebrow text-btp-600">
              <span
                aria-hidden
                className="mr-2 inline-block h-4 w-1 rounded-sm bg-btp-500 align-middle"
              />
              Génie Sélect
            </span>

            <h1 className="volta-display mt-4 text-4xl leading-[1.08] text-acier-900 sm:text-5xl lg:text-[3.4rem]">
              Un groupe. 6 expertises.
              <br />
              Une seule plateforme pour <span className="text-btp-600">vos projets.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg font-semibold text-acier-900">
              VOLTA est la plateforme digitale de Génie Sélect.
            </p>
            <p className="mt-1.5 max-w-xl text-lg leading-relaxed text-papier-700">
              Louez, achetez, équipez, entretenez, digitalisez et formez vos équipes grâce à nos
              solutions intégrées.
            </p>
          </Reveal>

          {note && (
            <Reveal delay={0.12} className="hidden lg:block">
              <p className="text-right font-serif text-3xl italic leading-tight text-acier-900">
                Avançons
                <br />
                vos projets
                <br />
                ensemble !
                <span aria-hidden className="ml-auto mt-2 block h-1 w-40 rounded-full bg-btp-500" />
              </p>
            </Reveal>
          )}
        </div>

        {/* Les quatre promesses, sur une ligne sous la couverture. Elles
            répondent à la question que pose le titre — « pourquoi vous » —
            avant que le visiteur ait à la formuler.

            Séparées par un filet plutôt que posées dans des cases : la maquette
            les donne comme une seule phrase en quatre temps. */}
        <Reveal delay={0.16}>
          <ul className="mt-10 grid gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROMESSES.map(({ icon: Icon, titre, detail }, i) => (
              <li
                key={titre}
                className={`flex items-center gap-3 lg:px-5 ${
                  i > 0 ? 'lg:border-l lg:border-papier-300' : ''
                }`}
              >
                <Icon size={26} className="shrink-0 text-btp-500" strokeWidth={1.75} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-acier-900">{titre}</span>
                  <span className="block text-sm text-papier-700">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
