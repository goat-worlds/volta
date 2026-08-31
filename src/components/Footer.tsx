import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-sm font-black text-slate-900">
                V
              </div>
              <span>VOLTA</span>
            </Link>
            <p className="mt-2 text-sm text-slate-400">
              Plateforme de référencement et vérification d'engins de chantier en Côte d'Ivoire.
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Plateforme</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-white">
                  Équipements
                </Link>
              </li>
              <li>
                <Link to="/fournisseurs" className="hover:text-white">
                  Fournisseurs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">Informations</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-white">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Vérification
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Conditions d'utilisation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">Contact</h4>
            <p className="mt-4 text-sm text-slate-400">
              support@volta.ci
              <br />
              +225 00 00 00 00
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
          <p>© 2026 VOLTA — Équipements de chantier vérifiés en Côte d'Ivoire</p>
        </div>
      </div>
    </footer>
  )
}
