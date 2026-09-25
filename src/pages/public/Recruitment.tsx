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
import {
  Card,
  CardGrid,
  CardIcon,
  PrimaryLink,
  Reveal,
  Section,
  SectionActions,
  SectionHeader,
} from '../../components/site/SiteKit'

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
 *
 * Elle avait sa propre mise en page : bandeau à deux colonnes avec filet de
 * sécurité, halo ambré, photo incrustée d'un encart flottant, trois chiffres
 * en pied de couverture, puis des cartes à coins très arrondis et des numéros
 * fantômes en filigrane. Elle passe par le vocabulaire commun
 * (components/site/SiteKit) : mêmes fonds alternés, mêmes chapeaux centrés,
 * mêmes cartes que l'accueil et que le Market.
 */

const TRADES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Wrench, title: 'Mécanicien', text: 'Engins de terrassement, levage, transport — entretien et réparation sur site.' },
  { icon: Cog, title: 'Mécanicien diesel', text: 'Moteurs et injection des engins lourds, diagnostic et remise en route.' },
  { icon: Droplets, title: 'Hydraulicien', text: 'Circuits, vérins, pompes et distributeurs : la force des engins passe par vous.' },
  { icon: Zap, title: 'Électricien / électromécanicien', text: 'Faisceaux, calculateurs, groupes électrogènes et diagnostics électroniques.' },
  { icon: HardHat, title: 'Technicien de maintenance', text: 'Préventif, correctif, suivi des plans d’entretien sur les parcs clients.' },
  { icon: Search, title: 'Vérificateur d’engins', text: 'Inspections VOLTA : 18 points de contrôle, photos, rapport avant publication.' },
  { icon: Map, title: 'Opérateurs d’engins', text: 'Conduite de pelles, chargeuses, compacteurs sur les missions clients.' },
  { icon: Flame, title: 'Soudeur', text: 'Réparations structurelles, châssis, godets et accessoires.' },
]

/**
 * Le processus tel qu'il se déroule vraiment.
 *
 * Il promettait un entretien technique et un vivier, sans dire ce qu'on dépose
 * ni comment on est recontacté. Chaque étape nomme donc ce qu'elle demande et
 * ce qu'elle rend : le dossier déposé, la référence qui sert à suivre, et la
 * date de rencontre que VOLTA fixe et que le candidat lit lui-même.
 */
const PROCESS: { status: CandidateStatus; icon: LucideIcon; text: string }[] = [
  { status: 'TO_REVIEW', icon: FileUp, text: 'Vous déposez votre dossier : votre CV (facultatif) et vos coordonnées. Vous recevez un numéro de référence.' },
  { status: 'SHORTLISTED', icon: UserCheck, text: 'VOLTA lit votre profil et retient ceux qui correspondent aux besoins des clients.' },
  { status: 'INTERVIEW', icon: Mic, text: 'VOLTA fixe une date de rencontre. Vous la consultez avec votre référence, sur la page Suivre ma demande.' },
  { status: 'VALIDATED', icon: BadgeCheck, text: 'Après la rencontre, VOLTA vous recontacte et valide votre profil.' },
  { status: 'ONBOARDED', icon: Users, text: 'Votre compte technicien est créé et vous recevez des propositions de mission.' },
]

const OFFERS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ShieldCheck,
    title: 'Des missions chez des clients qualifiés',
    text: 'Chaque demande de technicien est qualifiée par VOLTA avant de vous être proposée : chantier identifié, besoin précis, conditions connues.',
  },
  {
    icon: Award,
    title: 'Un profil qui vaut par ce qu’il sait faire',
    text: 'L’audition technique compte autant que le diplôme. Un bon mécanicien sans certificat a sa place dans le vivier.',
  },
  {
    icon: Users,
    title: 'Un interlocuteur, pas une plateforme anonyme',
    text: 'VOLTA vous connaît, suit vos missions et vous recontacte quand un besoin correspond à vos compétences.',
  },
]

export default function Recruitment() {
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-acier-900 px-4 py-20 text-center sm:px-6">
        <img
          src="/engins/pelle-cat-6015b.jpeg"
          alt=""
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-acier-900/70 via-acier-900/85 to-acier-900"
        />
        <Reveal className="mx-auto max-w-3xl">
          <span className="volta-eyebrow text-btp-400">
            <HardHat size={14} />
            Recrutement · Équipe technique VOLTA
          </span>
          <h1 className="volta-display mt-4 text-5xl text-white sm:text-6xl">
            Vos compétences, <span className="text-btp-400">nos chantiers</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-acier-200">
            VOLTA constitue son équipe technique : mécaniciens, hydrauliciens, électriciens,
            vérificateurs, opérateurs. Déposez votre CV, passez l’audition, recevez des missions.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <PrimaryLink to="/recrutement/candidature">
              <FileUp size={16} />
              Déposer ma candidature
            </PrimaryLink>
            <a
              href="#metiers"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:border-btp-400"
            >
              Voir les métiers
              <ArrowRight size={16} />
            </a>
          </div>
          {/* Trois chiffres alignés sous un titre : la page les avait en pied
              de couverture, comme toutes les pages d'accueil du monde. Ils se
              lisent en une phrase, et ce qu'ils annoncent est juste en dessous. */}
          <p className="mx-auto mt-10 max-w-2xl border-t border-white/10 pt-6 text-sm leading-relaxed text-acier-300">
            Huit métiers recherchés, cinq étapes de sélection, dix-huit points de contrôle par
            inspection. Profils étudiés, auditionnés, sélectionnés — c’est ce que VOLTA promet à ses
            clients, et ce qui fait votre valeur.
          </p>
        </Reveal>
      </section>

      <Section id="metiers" tone="light">
        <SectionHeader
          label="Métiers recherchés"
          title="Huit métiers, un même terrain."
          text="Les besoins viennent des clients de VOLTA : parcs d’engins à entretenir, pannes à diagnostiquer, machines à inspecter avant publication."
        />
        <CardGrid columns={4}>
          {TRADES.map((t, i) => (
            <Reveal key={t.title} delay={(i % 4) * 0.06}>
              <Card>
                <CardIcon icon={t.icon} />
                <h3 className="volta-display mt-4 text-xl leading-tight text-acier-900">{t.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-papier-600">{t.text}</p>
              </Card>
            </Reveal>
          ))}
        </CardGrid>
      </Section>

      <Section tone="muted">
        <SectionHeader
          tone="muted"
          label="Processus de sélection"
          title="Ce qui se passe après l’envoi."
          text="Cinq étapes, et une référence pour suivre la vôtre. Une candidature non retenue est mise en attente, jamais perdue : les besoins changent."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS.map((p, i) => (
            <Reveal key={p.status} delay={(i % 5) * 0.06}>
              <Card tone="muted">
                <div className="flex items-center gap-3">
                  <CardIcon icon={p.icon} />
                  <span className="text-xs font-bold uppercase tracking-wider text-papier-600">
                    Étape {i + 1}
                  </span>
                </div>
                <h3 className="volta-display mt-4 text-xl leading-tight text-acier-900">
                  {CANDIDATE_STATUS_LABELS[p.status]}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-papier-600">{p.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="light">
        <SectionHeader
          label="Ce que vous y gagnez"
          title="Pourquoi passer par VOLTA."
        />
        <CardGrid>
          {OFFERS.map((o, i) => (
            <Reveal key={o.title} delay={(i % 3) * 0.06}>
              <Card>
                <CardIcon icon={o.icon} />
                <h3 className="volta-display mt-4 text-xl leading-tight text-acier-900">{o.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-papier-600">{o.text}</p>
              </Card>
            </Reveal>
          ))}
        </CardGrid>

        <SectionActions>
          <PrimaryLink to="/recrutement/candidature">
            <FileUp size={16} />
            Déposer ma candidature
          </PrimaryLink>
        </SectionActions>
      </Section>
    </div>
  )
}
