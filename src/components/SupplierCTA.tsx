import { Link } from 'react-router-dom'
import { ArrowRight, Check, ShoppingCart, Truck } from 'lucide-react'

/**
 * Appel final — à ceux qui ont du matériel.
 *
 * Il ne proposait que « devenir fournisseur » vers l'inscription. Or on
 * vend : le détenteur d'un engin peut le louer, ou le mettre en vente sur
 * Volta Market. Les deux gestes sont offerts, chacun vers son parcours.
 */
const ARGUMENTS = [
  'Un réseau de clients qualifiés par Génie Sélect',
  'Une inspection VOLTA qui valorise votre matériel',
  'Aucune commission sur la mise en relation',
]

export default function SupplierCTA() {
  return (
    <section className="bg-acier-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-btp-400">
              Vous avez du matériel
            </span>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Louez-le. Vendez-le.
              <br />
              <span className="text-btp-400">VOLTA s’occupe de la mise en relation.</span>
            </h2>
            <p className="mt-4 text-lg text-acier-200">
              Un engin qui dort coûte. Référencez-le à la location, ou proposez-le à la vente sur
              Volta Market : l’équipe le vérifie, le publie et le met en avant.
            </p>
            <ul className="mt-6 space-y-3">
              {ARGUMENTS.map((a) => (
                <li key={a} className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-btp-500">
                    <Check size={14} strokeWidth={3} className="text-acier-900" />
                  </span>
                  <span className="text-acier-100">{a}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/proposer-un-engin"
                className="inline-flex items-center gap-2 rounded-xl bg-btp-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-btp-600"
              >
                <Truck size={16} />
                Proposer mon engin à la location
              </Link>
              <Link
                to="/inscription"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:border-btp-400 hover:bg-white/5"
              >
                <ShoppingCart size={16} />
                Vendre sur Volta Market
                <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mt-3 text-xs text-acier-300">
              La vente se fait depuis l’espace fournisseur : créez un compte, l’équipe vous ouvre
              l’accès.
            </p>
          </div>

          <div className="relative hidden md:block">
            <img
              src="/engins/grue-mobile.jpeg"
              alt="Grue mobile"
              className="rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
            />
            <div className="absolute -bottom-5 -left-5 rounded-xl border border-white/10 bg-acier-800/95 p-4 backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-wider text-acier-300">
                Sur Volta Market
              </div>
              <div className="mt-1 font-bold text-white">Examinée, publiée, mise en avant</div>
              <div className="text-sm text-btp-300">C’est l’équipe VOLTA qui décide de la sélection</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
