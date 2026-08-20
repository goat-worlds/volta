import { Link } from 'react-router-dom'
import { IconPhone, IconEnvelope, IconMapPin } from './Icons'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
                <img src="/volta-logo.svg" alt="VOLTA" className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">VOLTA</h3>
                <p className="text-xs text-slate-500">Plateforme de mise en relation</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              VOLTA connecte les clients avec les fournisseurs d'équipements vérifiés en Côte d'Ivoire.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Accès rapide</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/catalogue" className="text-slate-400 hover:text-white transition">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link to="/fournisseurs" className="text-slate-400 hover:text-white transition">
                  Fournisseurs
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-400 hover:text-white transition">
                  Tarifs
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* For Suppliers */}
          <div>
            <h4 className="font-semibold text-white mb-4">Pour les fournisseurs</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/supplier" className="text-slate-400 hover:text-white transition">
                  Rejoindre VOLTA
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition">
                  Support fournisseur
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition">
                  Conditions d'utilisation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Nous contacter</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <IconPhone className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <a href="tel:+22507000000" className="text-slate-400 hover:text-white transition">
                  +225 07 00 00 00
                </a>
              </li>
              <li className="flex items-start gap-3">
                <IconEnvelope className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <a href="mailto:contact@volta.ci" className="text-slate-400 hover:text-white transition">
                  contact@volta.ci
                </a>
              </li>
              <li className="flex items-start gap-3">
                <IconMapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">
                  Abidjan, Côte d'Ivoire
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-slate-500 mb-4 md:mb-0">
            © {currentYear} VOLTA. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-white transition">
              Politique de confidentialité
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition">
              Conditions d'utilisation
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
