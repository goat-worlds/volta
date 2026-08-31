import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function SupplierCTA() {
  return (
    <section className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Vous possédez des engins de chantier ?</h2>
            <p className="mt-4 text-lg text-slate-300">
              Référencez vos machines sur VOLTA et donnez-leur de la visibilité auprès de clients à la recherche d'équipements fiables.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full bg-yellow-400 w-8 h-8">
                  <span className="text-sm font-bold text-slate-900">✓</span>
                </span>
                <span>Accès à un réseau professionnel</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full bg-yellow-400 w-8 h-8">
                  <span className="text-sm font-bold text-slate-900">✓</span>
                </span>
                <span>Certification de qualité VOLTA</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full bg-yellow-400 w-8 h-8">
                  <span className="text-sm font-bold text-slate-900">✓</span>
                </span>
                <span>Support et accompagnement</span>
              </div>
            </div>

            <Link
              to="/inscription"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-slate-900 transition hover:bg-yellow-500"
            >
              Devenir fournisseur
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="hidden md:block">
            <img
              src="/engins/grue-mobile.jpeg"
              alt="Grue mobile"
              className="rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
