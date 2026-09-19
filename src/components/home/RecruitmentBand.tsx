import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, FileUp, HardHat } from 'lucide-react'

/**
 * Bandeau recrutement.
 *
 * Le mécanicien venu déposer son CV ne se reconnaît ni dans « louer » ni dans
 * « acheter » : le site lui parlait par une carte parmi huit. Le bandeau lui
 * est adressé, avec les métiers cherchés et le geste attendu.
 */
const TRADES = ['Mécanicien', 'Hydraulicien', 'Électricien', 'Vérificateur', 'Opérateur', 'Soudeur']

export default function RecruitmentBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-acier-900">
        <img loading="lazy"
          src="/engins/pelle-cat-6015b.jpeg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-acier-900 via-acier-900/90 to-acier-900/40" />
        <div className="relative grid gap-8 p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:p-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-btp-500/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-btp-300 ring-1 ring-btp-500/30">
              <HardHat size={14} />
              Recrutement · Équipe technique
            </span>
            <h2 className="mt-5 volta-display text-4xl text-white md:text-5xl">
              Vous réparez, vous conduisez, vous inspectez ?
              <br />
              <span className="text-btp-400">Rejoignez l’équipe technique de Génie Sélect.</span>
            </h2>
            <p className="mt-4 max-w-xl text-acier-200">
              Déposez votre CV, passez l’audition technique, recevez des missions chez des clients
              qualifiés. Votre pratique compte autant que vos diplômes.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {TRADES.map((t) => (
                <li key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-acier-100">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Link
              to="/recrutement/candidature"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-btp-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-btp-600"
            >
              <FileUp size={16} />
              Déposer mon CV
            </Link>
            <Link
              to="/recrutement"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:border-btp-400 hover:bg-white/5"
            >
              Métiers et processus
              <ArrowRight size={16} />
            </Link>
            <p className="inline-flex items-center gap-1.5 text-xs text-acier-300 md:text-right">
              <BadgeCheck size={14} className="text-emerald-400" />
              Candidature suivie par référence
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
