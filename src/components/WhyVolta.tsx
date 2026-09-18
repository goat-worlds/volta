import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * Ce que VOLTA vérifie à votre place.
 *
 * La section a d'abord répété les trois chiffres du bandeau dans trois cadres
 * gris, puis a énuméré six garanties en six cartes à icône — la même carte que
 * les parcours, que les niveaux, que le Market. À force, la page entière se
 * lisait comme une grille de vignettes interchangeables.
 *
 * Ici, pas de carte. L'inspection est racontée : ce qu'il se passe quand le
 * vérificateur arrive, en une prose qu'un loueur reconnaît. Les autres
 * garanties suivent en liste de définitions — un terme, son explication — la
 * forme d'un contrat plutôt que d'une plaquette.
 */

const GUARANTEES: { term: string; text: string }[] = [
  {
    term: 'Le niveau est attribué, pas déclaré',
    text: 'Basic, Silver ou Gold : c’est l’administration qui tranche, après lecture du rapport. Le propriétaire ne choisit pas la note de sa machine.',
  },
  {
    term: 'Le dossier reste ouvert',
    text: 'Qui a inspecté, quel jour, ce qui a été relevé, ce qu’il reste à corriger. Le fournisseur suit son dossier sans avoir à téléphoner pour savoir où il en est.',
  },
  {
    term: 'Plusieurs devis, côte à côte',
    text: 'Une demande part à plusieurs loueurs. Vous comparez les prix, les délais de mise à disposition et les conditions sur le même écran.',
  },
  {
    term: 'On sait à qui vous confiez le chantier',
    text: 'Raison sociale, coordonnées, parc contrôlé. Pas de numéro de téléphone anonyme au bout d’une annonce.',
  },
  {
    term: 'Rien n’est prélevé au passage',
    text: 'VOLTA met en relation et ne prend pas de commission. Vous traitez aux conditions convenues entre vous.',
  },
]

export default function WhyVolta() {
  return (
    <section id="garanties" className="scroll-mt-16 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        {/* Le récit de l'inspection, en pleine largeur : c'est la promesse qui
            porte toutes les autres, elle mérite mieux qu'une carte parmi six. */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end lg:gap-16">
          <div>
            <span className="volta-eyebrow text-btp-600">Avant la mise en ligne</span>
            <h2 className="volta-display mt-4 max-w-2xl text-4xl text-acier-900 md:text-5xl">
              Quelqu’un se déplace et monte sur la machine.
            </h2>
            <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-papier-700">
              <p>
                Aucun engin n’entre au catalogue sur parole. Un vérificateur mandaté par Génie
                Sélect se rend là où la machine travaille, la fait démarrer, déroule dix-huit
                points de contrôle — moteur, transmission, hydraulique, freinage, sécurité,
                structure — photographie les organes sensibles et note ce qui cloche.
              </p>
              <p>
                Son rapport est lu avant toute publication. Si la machine n’est pas en état, elle
                ne sort pas : le propriétaire reçoit la liste de ce qu’il doit reprendre, et la
                fiche attend.
              </p>
            </div>
          </div>

          {/* Le seul chiffre de la section, tenu comme un tampon. Trois chiffres
              alignés auraient fait « statistiques de page d'accueil ». */}
          <div className="border-l-4 border-btp-500 pl-6">
            <div className="volta-display text-7xl leading-none text-acier-900">18</div>
            <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-papier-600">
              points de contrôle, sur place
            </p>
            <Link
              to="/catalogue"
              className="mt-5 inline-flex items-center gap-1.5 border-b-2 border-btp-400 pb-0.5 text-sm font-semibold text-acier-900 transition hover:border-btp-600 hover:text-btp-700"
            >
              Voir les engins qui sont passés par là
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Les garanties, en liste de définitions sur deux colonnes. Le filet
            sépare, l'alignement du terme et de son explication fait le reste. */}
        <dl className="mt-14 grid gap-x-16 gap-y-0 border-t border-papier-200 md:grid-cols-2">
          {GUARANTEES.map((g) => (
            <div key={g.term} className="border-b border-papier-200 py-6">
              <dt className="volta-display text-xl text-acier-900">{g.term}</dt>
              <dd className="mt-2 leading-relaxed text-papier-600">{g.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
