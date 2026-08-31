import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function Hero() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(query ? `/catalogue?q=${encodeURIComponent(query)}` : '/catalogue')
  }

  return (
    <section className="border-b border-slate-200 bg-gradient-to-br from-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-4 py-2 text-xs font-semibold text-yellow-800">
              ✓ PLATEFORME D'ENGINS VÉRIFIÉS
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              Engins de chantier
              <br />
              <span className="text-yellow-500">vérifiés.</span>
              <br />
              Trouvez le bon engin,
              <br />
              au bon moment.
            </h1>

            <p className="mt-6 max-w-lg text-lg text-slate-600">
              VOLTA référence, vérifie et publie des engins de chantier fiables. Comparez les équipements et trouvez des
              fournisseurs contrôlés en toute confiance.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex max-w-md overflow-hidden rounded-xl border border-slate-300 bg-white shadow-md">
              <div className="flex flex-1 items-center px-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un engin, une catégorie…"
                  className="ml-2 flex-1 py-3 text-sm focus:outline-none"
                />
              </div>
              <button type="submit" className="bg-yellow-400 px-6 font-semibold text-slate-900 transition hover:bg-yellow-500">
                Chercher
              </button>
            </form>
          </div>

          <div className="relative">
            <img
              src="/engins/pelle-cat-336e.jpeg"
              alt="Pelle hydraulique vérifiée"
              className="w-full rounded-2xl object-cover shadow-2xl"
            />
            <div className="absolute bottom-4 right-4 rounded-lg bg-white px-4 py-2 shadow-lg">
              <span className="text-xs font-semibold text-slate-700">✓ Engin vérifié</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
