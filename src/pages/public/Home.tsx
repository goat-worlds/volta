import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, LevelBadge, fmtPrice } from '../../components/ui'

export default function Home() {
  const { equipment, categories } = useStore()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [expandedCriteria, setExpandedCriteria] = useState<number | null>(null)

  const published = equipment.filter((e) => e.status === 'PUBLISHED')

  const criteria = [
    {
      icon: '🔧',
      title: 'Mécanicien qualifié',
      description: 'Chaque fournisseur dispose d\'un mécanicien certifié pour la maintenance et réparations urgentes sur site ou en atelier.',
      steps: ['Certification vérifiée', 'Disponibilité 24/7', 'Pièces de rechange'],
    },
    {
      icon: '⚡',
      title: 'Remplacement 24h',
      description: 'En cas de panne, un équipement de remplacement est garanti en moins de 24 heures pour minimiser vos arrêts.',
      steps: ['Diagnostic rapide', 'Remplacement immédiat', 'Suivi complet'],
    },
    {
      icon: '🏭',
      title: 'Entrepôt équipé',
      description: 'Nos fournisseurs possèdent un entrepôt avec pièces de rechange et outils nécessaires pour la maintenance.',
      steps: ['Stock permanent', 'Outils modernes', 'Logistique efficace'],
    },
  ]

  const benefits = [
    {
      icon: '✅',
      title: 'Vérification complète',
      description: 'Tous les équipements sont inspectés par notre équipe technique avant publication.',
    },
    {
      icon: '💰',
      title: 'Tarifs transparents',
      description: 'Pas de frais cachés. Prix fixes et connus à l\'avance pour votre budget.',
    },
    {
      icon: '🤝',
      title: 'Support dédié',
      description: 'Une équipe VOLTA disponible pour répondre à vos questions et résoudre les problèmes.',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero Section */}
      <section className="mt-8 rounded-2xl bg-gradient-to-r from-blue-800 to-blue-600 p-10 text-white">
        <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-4xl">
          Trouvez le bon équipement. Au bon moment.
        </h1>
        <p className="mt-4 max-w-2xl text-blue-100 leading-relaxed">
          VOLTA est la plateforme de référence pour la location d'équipements de chantier en Côte d'Ivoire.
          Nous connectons les entreprises de construction avec des fournisseurs vérifiés et fiables.
          Tous nos partenaires sont certifiés et disposent des ressources nécessaires pour assurer votre succès.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/catalogue"
            className="inline-block rounded-lg bg-white px-6 py-2.5 font-semibold hover:bg-blue-50 text-center transition transform hover:scale-105"
            style={{ color: '#FF8C00' }}
          >
            Parcourir le catalogue
          </Link>
          <Link
            to="/fournisseurs"
            className="inline-block rounded-lg border-2 border-white px-6 py-2.5 font-semibold text-white hover:bg-blue-700 text-center transition transform hover:scale-105"
          >
            Nos fournisseurs
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
            Catégories populaires
          </h2>
          <p className="mt-2 text-slate-600">
            Explorez nos différentes catégories d'équipements disponibles en location.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.id} to={`/catalogue?categorie=${c.id}`}>
              <Card
                className="p-5 text-center transition hover:shadow-lg h-full flex flex-col items-center justify-center cursor-pointer transform hover:scale-110"
                onMouseEnter={() => setHoveredCard(c.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="text-4xl mb-3 transition transform" style={{
                  transform: hoveredCard === c.id ? 'scale(1.2) rotate(10deg)' : 'scale(1)',
                }}>
                  {c.icon}
                </div>
                <div className="text-sm font-semibold" style={{ color: hoveredCard === c.id ? '#FF8C00' : '#1F2937' }}>
                  {c.name}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Technical Verification Criteria */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
            Critères de vérification technique
          </h2>
          <p className="mt-2 text-slate-600">
            Nos techniciens vérifient chaque fournisseur selon des critères stricts pour garantir votre tranquillité d'esprit.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {criteria.map((item, idx) => (
            <Card
              key={idx}
              className="p-6 h-full flex flex-col cursor-pointer transition transform hover:shadow-lg hover:scale-105"
              onClick={() => setExpandedCriteria(expandedCriteria === idx ? null : idx)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-5xl">{item.icon}</div>
                <span style={{ color: '#FF8C00' }} className="text-2xl font-bold">
                  {idx + 1}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#FF8C00' }}>
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-3 flex-1">
                {item.description}
              </p>
              {expandedCriteria === idx && (
                <div className="mt-4 pt-4 border-t border-slate-200 animate-pulse">
                  <div className="text-xs font-semibold mb-2" style={{ color: '#FF8C00' }}>
                    Étapes de vérification:
                  </div>
                  <ul className="space-y-2">
                    {item.steps.map((step, stepIdx) => (
                      <li key={stepIdx} className="text-sm text-slate-600 flex items-center gap-2">
                        <span style={{ color: '#FF8C00' }} className="font-bold">✓</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Why VOLTA Section */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
            Pourquoi choisir VOLTA ?
          </h2>
          <p className="mt-2 text-slate-600">
            VOLTA vous offre une solution complète, transparente et sécurisée pour vos besoins en équipements.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {benefits.map((item, idx) => (
            <Card key={idx} className="p-6 h-full flex flex-col transition transform hover:shadow-lg hover:-translate-y-1">
              <div className="text-5xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#FF8C00' }}>
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Equipment Section */}
      <section className="mt-12 mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
              Équipements en vedette
            </h2>
            <p className="mt-2 text-slate-600">
              Découvrez une sélection d'équipements populaires et disponibles immédiatement.
            </p>
          </div>
          <Link to="/catalogue" className="text-sm font-medium hover:underline whitespace-nowrap transition" style={{ color: '#FF8C00' }}>
            Voir tout →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {published.slice(0, 4).map((e) => (
            <Link key={e.id} to={`/equipment/${e.id}`}>
              <Card className="overflow-hidden transition hover:shadow-lg h-full flex flex-col transform hover:scale-105">
                <div className="relative h-40 overflow-hidden bg-slate-200">
                  <img src={e.photos[0]} alt={e.name} className="h-full w-full object-cover transition transform hover:scale-110" />
                  <div className="absolute top-2 right-2">
                    <LevelBadge level={e.level} />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="font-semibold text-slate-800 flex-1">{e.name}</div>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">{e.location}</div>
                  <div className="text-xs text-slate-600 mb-3 flex-1">
                    {e.brand} {e.model} • {e.year}
                  </div>
                  <div className="mt-auto pt-3 border-t border-slate-200">
                    <div className="font-bold text-lg transition" style={{ color: '#FF8C00' }}>
                      {fmtPrice(e.pricePerDay)} / jour
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
