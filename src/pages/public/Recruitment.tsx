import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Cog,
  Droplets,
  FileUp,
  Flame,
  HardHat,
  Map,
  Mic,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CANDIDATE_STATUS_LABELS, type CandidateStatus } from '../../types/domain'

/**
 * Recrutement — rejoindre l'équipe technique de Génie Sélect.
 *
 * Le parcours « Je veux rejoindre l'équipe technique » ouvrait un formulaire à
 * froid : le candidat ne savait ni quels métiers on cherche, ni ce qui se
 * passe après l'envoi, ni ce qu'il gagne à passer par Génie Sélect plutôt
 * que par le bouche-à-oreille. Cette page répond aux trois questions avant de
 * proposer le dépôt de CV.
 *
 * Les étapes affichées sont celles du traitement réel des candidatures
 * (types/domain, CandidateStatus) : la page promet le circuit qui existe,
 * pas un autre.
 */

const TRADES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Wrench, title: 'Mécanicien', text: 'Engins de terrassement, levage, transport — entretien et réparation sur site.' },
  { icon: Cog, title: 'Mécanicien diesel', text: 'Moteurs et injection des engins lourds, diagnostic et remise en route.' },
  { icon: Droplets, title: 'Hydraulicien', text: 'Circuits, vérins, pompes et distributeurs : la force des engins passe par vous.' },
  { icon: Zap, title: 'Électricien / électromécanicien', text: 'Faisceaux, calculateurs, groupes électrogènes et diagnostics électroniques.' },
  { icon: HardHat, title: 'Technicien de maintenance', text: 'Préventif, correctif, suivi des plans d’entretien sur les parcs clients.' },
  { icon: Search, title: 'Vérificateur d’engins', text: 'Inspections VOLTA : 18 points de contrôle, photos, rapport avant publication.' },
  { icon: Map, title: 'Opérateur d’engins', text: 'Conduite de pelles, chargeuses, compacteurs sur les missions clients.' },
  { icon: Flame, title: 'Soudeur', text: 'Réparations structurelles, châssis, godets et accessoires.' },
]

const PROCESS: { status: CandidateStatus; icon: LucideIcon; text: string }[] = [
  { status: 'TO_REVIEW', icon: FileUp, text: 'Votre CV et vos compétences sont lus par Génie Sélect.' },
  { status: 'SHORTLISTED', icon: UserCheck, text: 'Les profils qui correspondent aux besoins des clients sont retenus.' },
  { status: 'INTERVIEW', icon: Mic, text: 'Un entretien technique évalue votre pratique, pas seulement votre parcours.' },
  { status: 'VALIDATED', icon: BadgeCheck, text: 'Votre profil est validé et vos disponibilités enregistrées.' },
  { status: 'ONBOARDED', icon: Users, text: 'Vous rejoignez le vivier et recevez des propositions de mission.' },
]

const OFFERS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ShieldCheck,
    title: 'Des missions chez des clients qualifiés',
    text: 'Chaque demande de technicien est qualifiée par Génie Sélect avant de vous être proposée : chantier identifié, besoin précis, conditions connues.',
  },
  {
    icon: Award,
    title: 'Un profil qui vaut par ce qu’il sait faire',
    text: 'L’audition technique compte autant que le diplôme. Un bon mécanicien sans certificat a sa place dans le vivier.',
  },
  {
    icon: Users,
    title: 'Un interlocuteur, pas une plateforme anonyme',
    text: 'Génie Sélect vous connaît, suit vos missions et vous recontacte quand un besoin correspond à vos compétences.',
  },
]

export default function Recruitment() {
  return (
    <div>
      <section className="relative overflow-hidden bg-acier-900">
        <div className="btp-hazard-stripe h-2 w-full" aria-hidden />
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-20 h-[26rem] w-[26rem] rounded-full bg-btp-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-btp-500/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-btp-300 ring-1 ring-btp-500/30">
                <HardHat size={14} />
                Recrutement · Équipe technique Génie Sélect
              </span>
              <h1 className="mt-6 volta-display text-5xl text-white md:text-6xl">
                Vos compétences,
                <br />
                <span className="text-btp-400">nos chantiers.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-acier-200">
                Génie Sélect constitue l’équipe technique de VOLTA : mécaniciens, hydrauliciens,
                électriciens, vérificateurs, opérateurs. Déposez votre CV, passez l’audition,
                recevez des missions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/recrutement/candidature"
                  className="inline-flex items-center gap-2 rounded-xl bg-btp-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-btp-600"
                >
                  <FileUp size={16} />
                  Déposer ma candidature
                </Link>
                <a
                  href="#metiers"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:border-btp-400 hover:bg-white/10"
                >
                  Voir les métiers
                  <ArrowRight size={16} />
                </a>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
                {[
                  { value: '8', label: 'métiers recherchés' },
                  { value: '5', label: 'étapes de sélection' },
                  { value: '18', label: 'points de contrôle par inspection' },
                ].map((s) => (
                  <div key={s.label}>
                    <dt className="volta-display text-3xl text-btp-400">{s.value}</dt>
                    <dd className="mt-0.5 text-xs text-acier-300">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
                <img loading="lazy" src="/engins/pelle-cat-6015b.jpeg" alt="Pelle sur chantier" className="aspect-[4/3] w-full object-cover" />
              </div>
              <div className="absolute -bottom-5 left-5 right-5 rounded-xl border border-white/10 bg-acier-800/95 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-btp-500 text-white">
                    <BadgeCheck size={20} />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">Profils étudiés, auditionnés, sélectionnés</div>
                    <div className="text-xs text-acier-300">C’est ce que VOLTA promet à ses clients — et ce qui fait votre valeur.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="metiers" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <span className="volta-eyebrow text-btp-600">Métiers recherchés</span>
          <h2 className="mt-3 volta-display text-4xl text-acier-900 md:text-5xl">Huit métiers, un même terrain.</h2>
          <p className="mt-4 text-lg text-papier-700">
            Les besoins viennent des clients de VOLTA : parcs d’engins à entretenir, pannes à
            diagnostiquer, machines à inspecter avant publication.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRADES.map((t) => (
            <article key={t.title} className="group rounded-2xl border border-papier-200 bg-white p-6 transition hover:border-btp-300 hover:shadow-lg">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-acier-900 text-btp-400 transition group-hover:bg-btp-500 group-hover:text-white">
                <t.icon size={20} />
              </span>
              <h3 className="mt-4 font-bold text-acier-900">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-papier-700">{t.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-papier-100 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <span className="volta-eyebrow text-btp-600">Processus de sélection</span>
            <h2 className="mt-3 volta-display text-4xl text-acier-900 md:text-5xl">Ce qui se passe après l’envoi.</h2>
            <p className="mt-4 text-lg text-papier-700">
              Cinq étapes, et une référence pour suivre la vôtre. Une candidature non retenue
              est mise en attente, jamais perdue : les besoins changent.
            </p>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-5">
            {PROCESS.map((p, i) => (
              <li key={p.status} className="relative rounded-2xl border border-papier-200 bg-white p-5">
                <span className="absolute right-4 top-3 volta-display text-4xl text-btp-100">0{i + 1}</span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-btp-50 text-btp-600">
                  <p.icon size={18} />
                </span>
                <h3 className="mt-3 font-bold text-acier-900">{CANDIDATE_STATUS_LABELS[p.status]}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-papier-700">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-5 lg:grid-cols-3">
          {OFFERS.map((o) => (
            <article key={o.title} className="rounded-2xl border border-papier-200 bg-white p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-btp-50 text-btp-600">
                <o.icon size={20} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-acier-900">{o.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-papier-700">{o.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-acier-900">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="volta-display text-4xl text-white">Prêt à déposer votre CV ?</h2>
              <p className="mt-2 max-w-xl text-acier-200">
                Trois étapes courtes : votre profil, vos compétences, votre CV. Vous recevez une
                référence pour suivre votre candidature.
              </p>
            </div>
            <Link
              to="/recrutement/candidature"
              className="inline-flex items-center gap-2 rounded-xl bg-btp-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-btp-600"
            >
              <FileUp size={16} />
              Déposer ma candidature
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
