import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card } from '../../components/ui'

export default function Suppliers() {
  const { users, equipment } = useStore()
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null)

  const suppliers = users.filter((u) => u.role === 'SUPPLIER')
  const regions = [...new Set(suppliers.map((s) => s.city))]

  const criteria = [
    { icon: '🔧', label: 'Mécanicien qualifié', key: 'mechanic' },
    { icon: '⚡', label: 'Remplacement 24h', key: 'replacement' },
    { icon: '🏭', label: 'Entrepôt équipé', key: 'warehouse' },
  ]

  const filteredSuppliers = selectedRegion
    ? suppliers.filter((s) => s.city === selectedRegion)
    : suppliers

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 px-4 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-3">Nos fournisseurs partenaires</h1>
          <p className="text-lg text-blue-100 mb-4 max-w-2xl">
            Découvrez notre réseau de fournisseurs vérifiés et certifiés.
            Tous nos partenaires respectent les critères stricts de VOLTA pour garantir la qualité et la fiabilité de leurs services.
          </p>
          <div className="flex flex-col gap-2 text-sm text-blue-100">
            <div>✓ Inspections techniques complètes</div>
            <div>✓ Certifications vérifiées</div>
            <div>✓ Support disponible 24/7</div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: '#FF8C00' }}>
              {suppliers.length}
            </div>
            <div className="text-slate-600">Fournisseurs actifs</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: '#FF8C00' }}>
              {equipment.filter((e) => e.status === 'PUBLISHED').length}
            </div>
            <div className="text-slate-600">Équipements disponibles</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: '#FF8C00' }}>
              100%
            </div>
            <div className="text-slate-600">Certifiés VOLTA</div>
          </Card>
        </div>

        {/* Criteria Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#FF8C00' }}>
            Critères de certification
          </h2>
          <p className="text-slate-600 mb-6">
            Tous nos fournisseurs doivent répondre à ces critères essentiels pour rejoindre notre plateforme.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {criteria.map((crit) => (
              <Card key={crit.key} className="p-6 hover:shadow-lg transition">
                <div className="text-5xl mb-3">{crit.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#FF8C00' }}>
                  {crit.label}
                </h3>
                <p className="text-sm text-slate-600">
                  {crit.key === 'mechanic' && 'Un mécanicien certifié disponible pour maintenance et réparations urgentes.'}
                  {crit.key === 'replacement' && 'Garantie de remplacement d\'équipement en moins de 24 heures en cas de panne.'}
                  {crit.key === 'warehouse' && 'Entrepôt équipé avec pièces de rechange et outils nécessaires.'}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#FF8C00' }}>
            Fournisseurs par région
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRegion('')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedRegion === ''
                  ? 'text-white'
                  : 'text-slate-700 border border-slate-300 hover:border-orange-300'
              }`}
              style={{ backgroundColor: selectedRegion === '' ? '#FF8C00' : 'transparent' }}
            >
              Tous ({suppliers.length})
            </button>
            {regions.map((region) => {
              const count = suppliers.filter((s) => s.city === region).length
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedRegion === region
                      ? 'text-white'
                      : 'text-slate-700 border border-slate-300 hover:border-orange-300'
                  }`}
                  style={{ backgroundColor: selectedRegion === region ? '#FF8C00' : 'transparent' }}
                >
                  {region} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid gap-6">
          {filteredSuppliers.map((s) => {
            const count = equipment.filter((e) => e.supplierId === s.id && e.status === 'PUBLISHED').length
            const isExpanded = expandedSupplier === s.id

            return (
              <Card
                key={s.id}
                className="p-6 cursor-pointer transition hover:shadow-lg hover:scale-105"
                onClick={() => setExpandedSupplier(isExpanded ? null : s.id)}
              >
                {/* Main Info */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex gap-4 flex-1">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-xl font-bold text-white text-2xl shrink-0"
                      style={{ backgroundColor: '#FF8C00' }}
                    >
                      {s.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{s.company}</h3>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          ✓ Certifié
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div className="text-sm">
                          <div className="text-slate-500">📍 Région</div>
                          <div className="font-semibold text-slate-800">{s.city}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-slate-500">🚜 Équipements</div>
                          <div className="font-semibold text-slate-800">{count}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-slate-500">📞 Contact</div>
                          <div className="font-semibold text-slate-800">{s.phone}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-slate-500">📧 Email</div>
                          <div className="font-semibold text-slate-800 truncate">{s.email}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to="/catalogue"
                    className="px-6 py-3 rounded-lg text-white font-bold transition transform hover:scale-105 whitespace-nowrap text-center"
                    style={{ backgroundColor: '#FF8C00' }}
                  >
                    Voir équipements →
                  </Link>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-slate-200 animate-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {criteria.map((crit) => (
                        <div
                          key={crit.key}
                          className="p-4 rounded-lg"
                          style={{ backgroundColor: '#FF8C00' + '15' }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{crit.icon}</span>
                            <h4 className="font-bold" style={{ color: '#FF8C00' }}>
                              {crit.label}
                            </h4>
                          </div>
                          <p className="text-sm text-slate-600">
                            {crit.key === 'mechanic' && '✓ Mécanicien certifié disponible'}
                            {crit.key === 'replacement' && '✓ Garantie complète'}
                            {crit.key === 'warehouse' && '✓ Stock permanent'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Equipment Preview */}
                    {count > 0 && (
                      <div className="mt-4">
                        <h4 className="font-bold mb-3" style={{ color: '#FF8C00' }}>
                          Équipements populaires ({count} disponibles)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {equipment
                            .filter((e) => e.supplierId === s.id && e.status === 'PUBLISHED')
                            .slice(0, 2)
                            .map((e) => (
                              <div key={e.id} className="p-3 rounded bg-slate-50 border border-slate-200">
                                <div className="font-semibold text-slate-800">{e.name}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {e.brand} {e.model} • {e.year}
                                </div>
                                <div className="text-sm font-bold mt-2" style={{ color: '#FF8C00' }}>
                                  {e.pricePerDay.toLocaleString()} FCFA/jour
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {filteredSuppliers.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Aucun fournisseur trouvé</h3>
            <p className="text-slate-600">Essayez une autre région</p>
          </Card>
        )}

        {/* CTA Section */}
        <div className="mt-16 rounded-2xl p-10 text-white" style={{ backgroundColor: '#FF8C00' }}>
          <h2 className="text-2xl font-bold mb-3">Vous êtes fournisseur ?</h2>
          <p className="mb-5 text-orange-100 max-w-2xl">
            Rejoignez le réseau VOLTA et accédez à une clientèle stable et de confiance.
            Profitez de nos services de marketing, de gestion de paiements et de support technique.
          </p>
          <button className="px-6 py-3 rounded-lg bg-white font-bold transition hover:scale-105" style={{ color: '#FF8C00' }}>
            Demander à nous rejoindre →
          </button>
        </div>
      </div>
    </div>
  )
}
