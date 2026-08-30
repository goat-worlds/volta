import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, LevelBadge, fmtPrice } from '../../components/ui'

const STEPS = [
  { icon: '📋', title: 'Référencer', text: 'Le fournisseur déclare son engin avec documents, photos et tarifs.' },
  { icon: '🔍', title: 'Vérifier', text: "Une équipe technique inspecte l'engin sur site avec checklist et preuves." },
  { icon: '✅', title: 'Décider & Publier', text: "L'administrateur valide, attribue un niveau (Basic, Silver, Gold) et publie." },
  { icon: '🤝', title: 'Mettre en relation', text: 'Le client recherche, compare et envoie sa demande de location.' },
]

export default function Home() {
  const { equipment, categories } = useStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const published = equipment.filter((e) => e.status === 'PUBLISHED')

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(query ? `/catalogue?q=${encodeURIComponent(query)}` : '/catalogue')
  }

  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div>
            <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
              Engins vérifiés en Côte d'Ivoire
            </span>
            <h1 className="mt-4 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              Trouvez le bon engin.
              <br />
              <span className="text-yellow-500">Au bon moment.</span>
            </h1>
            <p className="mt-4 max-w-md text-slate-600">
              VOLTA référence, vérifie et publie des engins de chantier fiables. Louez en toute confiance auprès de
              fournisseurs contrôlés.
            </p>
            <form onSubmit={search} className="mt-6 flex max-w-md overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pelle, grue, camion…"
                className="flex-1 px-4 py-3 text-sm focus:outline-none"
              />
              <button type="submit" className="bg-yellow-400 px-5 font-semibold text-slate-900 hover:bg-yellow-500">
                Rechercher
              </button>
            </form>
          </div>
          <div className="hidden md:block">
            <img
              src="/engins/pelle-cat-336e.jpeg"
              alt="Pelle hydraulique sur chantier"
              className="w-full rounded-2xl object-cover shadow-lg"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Catégories populaires</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {categories.map((c) => (
              <Link key={c.id} to={`/catalogue?categorie=${c.id}`}>
                <Card className="p-4 text-center transition hover:border-yellow-400 hover:shadow-md">
                  <div className="text-2xl">{c.icon}</div>
                  <div className="mt-2 text-sm font-medium text-slate-700">{c.name}</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Équipements en vedette</h2>
            <Link to="/catalogue" className="text-sm font-medium text-yellow-600 hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {published.slice(0, 4).map((e) => (
              <Link key={e.id} to={`/equipment/${e.id}`}>
                <Card className="overflow-hidden transition hover:shadow-md">
                  <img src={e.photos[0]} alt={e.name} className="h-36 w-full object-cover" />
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{e.name}</div>
                      <LevelBadge level={e.level} />
                    </div>
                    <div className="text-xs text-slate-500">{e.location}</div>
                    <div className="mt-2 font-bold text-slate-900">{fmtPrice(e.pricePerDay)} / jour</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Comment ça fonctionne ?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <Card key={s.title} className="p-5">
                <div className="text-3xl">{s.icon}</div>
                <div className="mt-3 font-bold text-slate-900">{s.title}</div>
                <p className="mt-1 text-sm text-slate-500">{s.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl bg-slate-900 p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold text-white">Vous possédez des engins de chantier ?</h2>
          <p className="mx-auto mt-2 max-w-lg text-slate-300">
            Référencez vos machines sur VOLTA : elles seront vérifiées par nos équipes techniques et publiées auprès de
            centaines de clients.
          </p>
          <Link
            to="/inscription"
            className="mt-6 inline-block rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-slate-900 hover:bg-yellow-500"
          >
            Devenir fournisseur
          </Link>
        </section>
      </div>
    </div>
  )
}
