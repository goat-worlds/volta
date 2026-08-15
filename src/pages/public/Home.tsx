import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, LevelBadge, fmtPrice } from '../../components/ui'

export default function Home() {
  const { equipment, categories } = useStore()
  const published = equipment.filter((e) => e.status === 'PUBLISHED')
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="mt-8 rounded-2xl bg-gradient-to-r from-blue-800 to-blue-600 p-10 text-white">
        <h1 className="max-w-xl text-3xl font-bold leading-tight md:text-4xl">
          Trouvez le bon équipement. Au bon moment.
        </h1>
        <p className="mt-3 max-w-lg text-blue-100">
          Des engins de chantier vérifiés par VOLTA pour vos projets en Côte d'Ivoire.
        </p>
        <Link
          to="/catalogue"
          className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 font-semibold text-blue-700 hover:bg-blue-50"
        >
          Voir le catalogue
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold">Catégories populaires</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.id} to={`/catalogue?categorie=${c.id}`}>
              <Card className="p-4 text-center transition hover:shadow-md">
                <div className="text-2xl">{c.icon}</div>
                <div className="mt-2 text-sm font-medium text-slate-700">{c.name}</div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Équipements en vedette</h2>
          <Link to="/catalogue" className="text-sm font-medium text-blue-600 hover:underline">
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
                  <div className="mt-2 font-bold text-blue-700">{fmtPrice(e.pricePerDay)} / jour</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
