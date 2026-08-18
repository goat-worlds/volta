import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, PageTitle, Toast } from '../../components/ui'
import { IconWrench, IconMapPin, IconCheck, IconHourglass } from '../../components/Icons'

const SUPPLIER_ID = 'u-sup-1'

export default function SupplierAddEquipment() {
  const navigate = useNavigate()
  const { equipment } = useStore()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    hours: 0,
    categoryId: '1',
    location: 'Abidjan',
    description: '',
    declaredCondition: 'Bon état',
    tier: 'BASIC',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'hours' ? parseInt(value) : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.brand || !form.model) {
      setToast('Remplissez tous les champs obligatoires')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setToast('Demande d\'ajout d\'équipement soumise pour inspection VOLTA')
      setTimeout(() => navigate('/supplier/equipment'), 2000)
    }, 800)
  }

  const myEquipmentCount = equipment.filter(e => e.supplierId === SUPPLIER_ID).length

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/supplier/equipment" className="text-sm font-medium text-brand-600 hover:underline">
        ← Retour aux équipements
      </Link>

      <div className="mt-4 mb-8">
        <PageTitle
          title="Ajouter un nouvel équipement"
          subtitle={`Vous avez actuellement ${myEquipmentCount} équipement(s) listés`}
        />
      </div>

      <Card className="p-8 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identité de l'équipement */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <IconCheck className="w-5 h-5" />
              Identité de l'équipement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom de l'équipement *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="ex: Pelle hydraulique"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Catégorie *
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  <option value="1">Pelles</option>
                  <option value="2">Bulldozers</option>
                  <option value="3">Grues</option>
                  <option value="4">Chargeurs</option>
                  <option value="5">Autres</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Marque *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="ex: Caterpillar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Modèle *
                </label>
                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="ex: 320D2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Année *
                </label>
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* État technique */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <IconWrench className="w-5 h-5" />
              État technique
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Heures compteur
                </label>
                <input
                  type="number"
                  name="hours"
                  value={form.hours}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  État déclaré
                </label>
                <select
                  name="declaredCondition"
                  value={form.declaredCondition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  <option>Excellent</option>
                  <option>Très bon</option>
                  <option>Bon état</option>
                  <option>Acceptable</option>
                  <option>Nécessite réparation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tier demandé
                </label>
                <select
                  name="tier"
                  value={form.tier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  <option value="BASIC">Basic</option>
                  <option value="SILVER">Silver</option>
                  <option value="GOLD">Gold</option>
                </select>
              </div>
            </div>
          </div>

          {/* Localisation et description */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <IconMapPin className="w-5 h-5" />
              Localisation & Description
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Localisation
              </label>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 mb-4"
              >
                <option>Abidjan</option>
                <option>Yamoussoukro</option>
                <option>Bouaké</option>
                <option>Daloa</option>
                <option>San-Pédro</option>
              </select>

              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description détaillée
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Décrivez l'état de l'équipement, les réparations récentes, la maintenance, etc."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
              />
            </div>
          </div>

          {/* Info importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 flex gap-2">
              <strong className="flex items-center gap-1">
                <IconCheck className="w-4 h-4 flex-shrink-0" />
                Important:
              </strong>
              <span>Après soumission, votre équipement sera inspecté par l'équipe technique VOLTA.
              Une fois l'inspection terminée et approuvée par l'administrateur, il sera catégorisé (A à E) et apparaîtra
              dans le catalogue public avec la notation assignée (Gold, Silver, ou Standard).</span>
            </p>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg bg-brand-600 text-white font-bold hover:bg-brand-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <IconHourglass className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <IconCheck className="w-4 h-4" />
                  Soumettre pour inspection
                </>
              )}
            </button>
            <Link
              to="/supplier/equipment"
              className="flex-1 px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-900 font-bold hover:bg-slate-50 transition text-center"
            >
              Annuler
            </Link>
          </div>
        </form>
      </Card>

      <Toast message={toast} />
    </div>
  )
}
