import { Link } from 'react-router-dom'
import {
  ArrowRight, Award, BadgeCheck, ClipboardCheck, GitBranch, Scale, ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Ce qui distingue VOLTA.
 *
 * La section reprenait les trois chiffres déjà affichés dans le hero — 100%,
 * 50+, 24/7 — dans trois cadres gris. Le visiteur lisait donc deux fois la même
 * chose, et rien qui explique en quoi la plateforme vaut mieux qu'une petite
 * annonce. Les cartes portent maintenant les garanties réelles du produit :
 * l'inspection physique, le classement, la traçabilité, la comparaison des
 * offres et l'absence de commission.
 */

interface Argument {
  Icon: LucideIcon
  title: string
  description: string
  /** Chiffre ou mention mise en avant, quand elle éclaire l'argument. */
  metric?: string
}

const HIGHLIGHT: Argument = {
  Icon: ClipboardCheck,
  title: 'Une équipe se déplace et contrôle la machine',
  description:
    "Aucun engin n'atteint le catalogue sur simple déclaration. Un vérificateur mandaté par VOLTA se rend sur place, déroule une checklist de dix-huit points, photographie les organes sensibles et consigne les anomalies. Son rapport est lu avant toute publication.",
  metric: '18 points de contrôle',
}

const ARGUMENTS: Argument[] = [
  {
    Icon: Award,
    title: 'Un classement, pas une étiquette',
    description:
      "Basic, Silver ou Gold : le niveau est attribué après lecture du rapport d'inspection, pas déclaré par le propriétaire.",
  },
  {
    Icon: GitBranch,
    title: 'Un dossier traçable',
    description:
      "Le fournisseur suit chaque étape de son dossier — qui l'a inspecté, quand, ce qui a été relevé, ce qu'il reste à corriger.",
  },
  {
    Icon: Scale,
    title: 'Plusieurs devis comparés',
    description:
      'Une demande, plusieurs offres chiffrées mises côte à côte : prix, délai de mise à disposition, conditions.',
  },
  {
    Icon: BadgeCheck,
    title: 'Des fournisseurs identifiés',
    description:
      'Raison sociale, coordonnées et parc contrôlés. Vous savez à qui vous confiez votre chantier.',
  },
  {
    Icon: ShieldCheck,
    title: 'Aucune commission',
    description:
      'VOLTA met en relation et ne prend rien au passage : vous traitez directement avec le fournisseur, aux conditions convenues entre vous.',
  },
]

export default function WhyVolta() {
  return (
    <section className="bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-btp-600">
            Nos garanties
          </span>
          <h2 className="mt-3 text-3xl font-bold text-acier-900 md:text-4xl">
            Pourquoi choisir VOLTA ?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Louer un engin sans l’avoir vu engage un chantier entier. Voici ce que nous
            vérifions à votre place.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* L'inspection est la promesse qui porte toutes les autres : elle
              occupe une colonne entière plutôt qu'une carte parmi six. */}
          <article className="relative overflow-hidden rounded-2xl bg-acier-900 p-8 lg:row-span-2">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-btp-500/20 blur-3xl"
            />
            <div className="relative">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-btp-500 text-white">
                <HIGHLIGHT.Icon size={24} />
              </span>
              {HIGHLIGHT.metric && (
                <div className="mt-6 text-3xl font-black text-btp-400">{HIGHLIGHT.metric}</div>
              )}
              <h3 className="mt-2 text-xl font-bold text-white">{HIGHLIGHT.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-acier-200">
                {HIGHLIGHT.description}
              </p>
              <Link
                to="/catalogue"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-btp-400 transition hover:text-btp-300"
              >
                Voir les engins vérifiés
                <ArrowRight size={15} />
              </Link>
            </div>
          </article>

          {ARGUMENTS.map(({ Icon, title, description }) => (
            <article
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-btp-300 hover:shadow-lg"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-btp-50 text-btp-600 transition group-hover:bg-btp-500 group-hover:text-white">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-bold text-acier-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
