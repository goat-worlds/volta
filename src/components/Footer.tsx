import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, Smartphone } from 'lucide-react'
import { TELEPHONE } from '../lib/siteNav'
import InstallAppButton from './site/InstallAppButton'
import Logo from './Logo'

/**
 * Pied de page.
 *
 * <h2>Quatre colonnes nommées par ce qu'on y cherche</h2>
 *
 * Il reprenait la structure de l'en-tête : les entrées principales, puis les
 * douze parcours à la file sous « Parcours ». C'est le classement de la
 * plateforme, pas celui du visiteur. Quelqu'un qui descend jusqu'ici cherche
 * une chose précise — faire réparer une machine, savoir ce qu'on garantit,
 * déposer son CV — et devait la trouver dans une liste rangée par public.
 *
 * Les colonnes portent donc les mots du visiteur : ce qu'est la plateforme, ce
 * qu'elle fait, ce qu'elle offre aux professionnels, ce qu'il faut comprendre
 * avant de s'engager.
 *
 * <h2>Pourquoi les liens sont écrits ici</h2>
 *
 * L'en-tête les lit dans `lib/siteNav` : c'est la navigation, elle doit être
 * la même partout. Le pied de page, lui, ne suit pas cette structure — il
 * regroupe autrement, et plusieurs de ses entrées sont des ancres de l'accueil
 * qui n'ont rien à faire dans un menu. Les dériver de `siteNav` obligerait à
 * y ajouter un classement que l'en-tête n'utiliserait jamais.
 *
 * Chaque adresse ci-dessous mène à une route réelle : un pied de page est le
 * dernier endroit où l'on clique avant de partir, et un lien mort y achève la
 * visite.
 */

interface Colonne {
  titre: string
  liens: { to: string; label: string }[]
}

const COLONNES: Colonne[] = [
  {
    titre: 'Plateforme',
    liens: [
      { to: '/', label: 'Accueil' },
      { to: '/market', label: 'VOLTA Market' },
      { to: '/catalogue', label: 'Louer un engin' },
      { to: '/recrutement', label: 'Recrutement' },
      { to: '/suivi', label: 'Suivre ma demande' },
    ],
  },
  {
    titre: 'Nos services',
    liens: [
      { to: '/demande/maintenance', label: 'Maintenance' },
      { to: '/demande/flotte', label: 'Gestion de flotte' },
      { to: '/market', label: 'Pièces de rechange' },
      { to: '/demande/formation', label: 'Formation technique' },
      { to: '/proposer-un-engin', label: 'Vendre ou louer son engin' },
    ],
  },
  {
    titre: 'Pour les professionnels',
    liens: [
      { to: '/catalogue-entreprise', label: 'Présenter ses équipements' },
      { to: '/accompagnement', label: 'Développer ses ventes' },
      { to: '/recrutement/candidature', label: 'Rejoindre l’équipe technique' },
    ],
  },
  {
    titre: 'Comprendre VOLTA',
    liens: [
      { to: '/#comment', label: 'Comment ça fonctionne' },
      { to: '/#garanties', label: 'Nos garanties' },
      { to: '/#niveaux', label: 'Niveaux de vérification' },
      { to: '/market#annonces', label: 'Annonces en ligne' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-acier-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Link to="/" className="inline-block">
              <Logo />
            </Link>
            {/* Le pays sous la marque : VOLTA opère en Côte d'Ivoire, et c'est
                la première chose qu'un visiteur venu d'ailleurs doit savoir. */}
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-acier-400">
              Côte d’Ivoire
            </p>

            <p className="mt-5 text-base font-semibold leading-snug text-white">
              Vos équipements. Vos chantiers. Notre expertise.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-acier-200">
              Location, vente, expertise technique et recrutement d’engins et d’équipements de
              chantier. Chaque engin est inspecté, chaque demande est qualifiée par VOLTA.
            </p>

            <ul className="mt-5 space-y-2 text-sm text-acier-200">
              <li className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-btp-400" aria-hidden />
                <a href="mailto:support@volta.ci" className="hover:text-white">
                  support@volta.ci
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-btp-400" aria-hidden />
                <a href={TELEPHONE.lien} className="hover:text-white">
                  +225 {TELEPHONE.affiche}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="shrink-0 text-btp-400" aria-hidden />
                Abidjan, Côte d’Ivoire
              </li>
            </ul>
          </div>

          {COLONNES.map((colonne) => (
            <div key={colonne.titre}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-btp-300">
                {colonne.titre}
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {colonne.liens.map((lien) => (
                  <li key={`${colonne.titre}-${lien.to}-${lien.label}`}>
                    <Link to={lien.to} className="text-acier-200 transition hover:text-white">
                      {lien.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* L'application, sur sa propre ligne.

            Elle vivait au bas de la colonne de marque, sous les coordonnées,
            où personne ne descend. Sur un chantier le réseau tombe, et ce qui
            est posé sur l'écran d'accueil garde ce qui a déjà été consulté :
            c'est une offre qui mérite d'être vue. */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-btp-500 text-white">
              <Smartphone size={17} aria-hidden />
            </span>
            <div>
              <div className="text-sm font-semibold text-white">VOLTA sur votre téléphone</div>
              <div className="text-sm text-acier-300">
                Accédez plus rapidement à vos demandes et services.
              </div>
            </div>
          </div>
          <InstallAppButton tone="dark" className="shrink-0" />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-acier-300 sm:flex-row sm:items-center">
          <p>Une mise en relation qualifiée, sans commission.</p>
          <p>© 2026 VOLTA — Engins et équipements vérifiés en Côte d’Ivoire.</p>
        </div>
      </div>
    </footer>
  )
}
