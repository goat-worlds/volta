import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { JOURNEY_COLUMNS, PRIMARY_LINKS, SECONDARY_LINKS } from '../lib/siteNav'
import InstallAppButton from './site/InstallAppButton'

/**
 * Pied de page.
 *
 * Il lit la même structure que l'en-tête (lib/siteNav) : les entrées
 * principales, les parcours, le suivi. Les liens morts « Comment ça marche »,
 * « Vérification », « Conditions » — trois « # » — sont remplacés par des
 * ancres réelles de l'accueil.
 *
 * La bande de sécurité signe l'en-tête, en haut de chaque page : répétée ici,
 * elle ne signait plus rien. C'est le téléchargement de l'application qui
 * ferme la colonne de gauche — le pied de page est l'endroit où on le cherche.
 */
export default function Footer() {
  const journeys = JOURNEY_COLUMNS.flatMap((c) => c.intents)

  return (
    <footer className="bg-acier-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-btp-500 text-lg font-black text-acier-900">
                V
              </span>
              <span className="leading-none">
                <span className="block text-lg font-black tracking-tight">VOLTA</span>
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-acier-300">
              <span className="lowercase">by</span> Génie Sélect Digital
            </span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-acier-200">
              Location, vente, expertise technique et recrutement d’engins et d’équipements de
              chantier en Côte d’Ivoire. Chaque engin est inspecté, chaque demande est qualifiée
              par VOLTA.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-acier-200">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-btp-400" />
                <a href="mailto:support@volta.ci" className="hover:text-white">support@volta.ci</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-btp-400" />
                <a href="tel:+2250748634853" className="hover:text-white">+225 07 48 63 48 53</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-btp-400" />
                Abidjan, Côte d’Ivoire
              </li>
            </ul>

            {/* Sur un chantier, le réseau tombe : l'application posée sur
                l'écran d'accueil garde ce qui a déjà été consulté. */}
            <InstallAppButton tone="dark" className="mt-6" />
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-btp-300">Plateforme</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/" className="text-acier-200 hover:text-white">Accueil</Link></li>
              {PRIMARY_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-acier-200 hover:text-white">{l.label}</Link>
                </li>
              ))}
              {SECONDARY_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-acier-200 hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-btp-300">Parcours</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {journeys.map((intent) => (
                <li key={intent.id}>
                  <Link to={intent.to} className="text-acier-200 hover:text-white">{intent.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-btp-300">Comprendre</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/#comment" className="text-acier-200 hover:text-white">Comment ça fonctionne</Link></li>
              <li><Link to="/#garanties" className="text-acier-200 hover:text-white">Nos garanties</Link></li>
              <li><Link to="/#niveaux" className="text-acier-200 hover:text-white">Niveaux de vérification</Link></li>
              <li><Link to="/market#annonces" className="text-acier-200 hover:text-white">Annonces en ligne</Link></li>
              <li><Link to="/recrutement#metiers" className="text-acier-200 hover:text-white">Métiers recherchés</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-acier-300 sm:flex-row sm:items-center">
          <p>© 2026 VOLTA — Engins et équipements vérifiés en Côte d’Ivoire</p>
          <p>Aucune commission : la mise en relation est qualifiée, jamais facturée.</p>
        </div>
      </div>
    </footer>
  )
}
