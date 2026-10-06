import { ArrowRight, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CHIFFRES, EXPERTISES, type Expertise } from '../../lib/genieSelect'
import { Reveal } from '../site/SiteKit'

/**
 * Les six domaines d'activité du groupe.
 *
 * <h2>Des cartes claires, et une couleur par marque</h2>
 *
 * Elles étaient six blocs d'acier identiques, portant chacun quatre étiquettes
 * d'un mot. On y lisait le périmètre du groupe, jamais ce qu'il s'engage à
 * faire — et rien ne distinguait GS MAINTENANCE de GS ACADEMY avant d'avoir lu
 * le titre. Or ces six marques existent hors du site : elles ont leurs devis,
 * leurs interlocuteurs, leur couleur.
 *
 * Chaque carte porte donc sa teinte, une tête — photo quand elle existe,
 * aplat et pictogramme sinon — ce que le pôle couvre en une phrase, et un lien
 * qui nomme la marque où il mène.
 *
 * <h2>Ce que la carte ne porte plus</h2>
 *
 * Elle a listé trois à quatre arguments à cocher sous sa description, et son
 * lien était un bouton plein de la couleur du pôle. Six cartes ainsi faites
 * donnaient une section de 1 400 px, et six aplats de couleur vive — orange,
 * marine, vert, rouge, violet, bleu — qui se disputaient le regard au point
 * qu'aucun ne le retenait.
 *
 * Les arguments disaient d'ailleurs ce que la description dit déjà. Ils sont
 * partis ; la teinte du pôle ne subsiste que sur le pictogramme, l'accroche et
 * le lien — assez pour distinguer six marques, pas assez pour crier.
 *
 * <h2>Pourquoi la carte n'est pas elle-même un lien</h2>
 *
 * Elle l'a été, pour que le doigt n'ait pas à viser une flèche. Mais un pôle
 * peut ouvrir sur deux gestes — GS RENTAL mène au catalogue et à la demande de
 * flotte — et un lien ne peut pas en contenir un autre : le HTML l'interdit.
 * Le bouton de pied est donc étiré sur toute la carte par un pseudo-élément :
 * la cible tactile reste la carte entière, et la porte secondaire, posée
 * au-dessus, se clique pour elle-même.
 */
function CarteExpertise({ e }: { e: Expertise }) {
  const Icon = e.icon
  const c = e.couleur

  return (
    <article className="group relative isolate flex h-full flex-col overflow-hidden rounded-xl border border-papier-200 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-offset-2">
      {/* Tête de carte. Sans photo juste, l'aplat de la marque : une pelle
          sous « Base Vie » dirait le contraire du texte. */}
      <div className="relative h-32 overflow-hidden">
        {e.image ? (
          <img
            src={e.image}
            alt=""
            aria-hidden
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${c.bandeau}`}>
            <Icon
              size={64}
              aria-hidden
              className="absolute -bottom-3 -right-2 text-white/20"
              strokeWidth={1.5}
            />
          </div>
        )}
        <span className="absolute left-4 top-3 text-xs font-bold tabular-nums text-white/70">
          {e.id}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${c.tuile}`}>
            <Icon size={22} className="text-white" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black uppercase tracking-wide text-acier-900">
              {e.nom}
            </span>
            <span className={`block text-sm font-bold ${c.texte}`}>{e.accroche}</span>
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-papier-600">{e.texte}</p>

        {/* Les portes secondaires passent devant le lien étiré, sinon il les
            recouvrirait et les avalerait au clic. */}
        {e.portes && e.portes.length > 0 && (
          <div className="relative z-10 mt-4 flex flex-wrap gap-2">
            {e.portes.map((p) => (
              <Link
                key={p.to + p.libelle}
                to={p.to}
                className={`inline-flex items-center gap-1.5 rounded-lg border border-papier-300 px-3 py-1.5 text-xs font-bold text-acier-900 transition hover:border-current ${c.texte} focus-visible:outline-none focus-visible:ring-2`}
              >
                {p.libelle}
                <ArrowRight size={13} />
              </Link>
            ))}
          </div>
        )}

        <Link
          to={e.to}
          className={`mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold transition group-hover:gap-2.5 ${c.texte} after:absolute after:inset-0 after:content-[''] focus-visible:outline-none`}
        >
          Découvrir {e.nom}
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  )
}

export default function ExpertisesGrid() {
  return (
    <section id="expertises" className="scroll-mt-16 bg-papier-50 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Le chapeau sur deux colonnes : le titre porte la promesse, la
            colonne de droite énumère. Empilés, on lisait deux fois la même
            chose. */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <Reveal>
            <span className="volta-eyebrow text-btp-600">
              <span aria-hidden className="mr-2 inline-block h-3 w-0.5 bg-btp-500" />
              Nos domaines d’activité
            </span>
            <h2 className="volta-display mt-3 text-4xl text-acier-900 sm:text-5xl">
              6 expertises pour répondre à <span className="text-btp-600">tous vos besoins</span>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-base leading-relaxed text-papier-600">
              Que vous soyez une entreprise, un maître d’ouvrage ou un partenaire, Génie Sélect vous
              accompagne à chaque étape de vos projets avec des solutions fiables, performantes et
              adaptées au terrain.
            </p>
          </Reveal>
        </div>

        {/* Six cartes de front sur grand écran, comme la maquette. En dessous
            elles se replient par trois puis par deux : à six colonnes sur un
            portable, chaque carte ferait la largeur d'un pouce. */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {EXPERTISES.map((e, i) => (
            <Reveal key={e.id} delay={(i % 3) * 0.06}>
              <CarteExpertise e={e} />
            </Reveal>
          ))}
        </div>

        {/* Les chiffres de la maison, et l'adresse de celui dont le besoin
            n'entre dans aucune des six cases : il ne doit pas repartir, il est
            adressé à quelqu'un plutôt qu'à une septième carte. */}
        <Reveal delay={0.1}>
          <div className="mt-10 grid gap-8 rounded-xl bg-acier-900 px-6 py-8 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-12">
            <dl className="grid gap-6 sm:grid-cols-3">
              {CHIFFRES.map((ch) => (
                <div key={ch.libelle}>
                  <dt className="volta-display text-4xl text-btp-400">{ch.valeur}</dt>
                  <dd className="mt-1 text-sm leading-snug text-acier-300">{ch.libelle}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <div>
                <p className="text-lg font-bold text-white">Un projet ? Parlons-en !</p>
                <p className="mt-1 text-sm leading-relaxed text-acier-300">
                  Nos équipes vous accompagnent pour trouver la solution adaptée à vos besoins.
                </p>
              </div>
              <Link
                to="/demande/location"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-btp-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-btp-600"
              >
                <MessageSquare size={16} />
                Nous contacter
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
