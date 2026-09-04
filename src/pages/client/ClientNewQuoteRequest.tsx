import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Send, AlertCircle, Loader2 } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { quoteRequestsClient } from '../../store/quotesClient'
import { Card, PageTitle } from '../../components/ui'

/**
 * Demande de devis.
 *
 * Seuls les équipements publiés sont proposés : demander un devis pour un
 * matériel non vérifié n'aurait pas de sens, et le backend refuserait de toute
 * façon la demande.
 *
 * Les mêmes règles sont vérifiées des deux côtés — quantité positive, période
 * cohérente. Le contrôle du navigateur évite un aller-retour inutile ; celui du
 * serveur est le seul qui protège, l'API étant appelable directement.
 */
export default function ClientNewQuoteRequest() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { currentUser, equipment } = useStore()

  // L'équipement peut être pré-sélectionné depuis la fiche produit.
  const [equipmentId, setEquipmentId] = useState(params.get('equipment') ?? '')
  const [quantity, setQuantity] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [message, setMessage] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const publishedEquipment = equipment.filter((e) => e.status === 'PUBLISHED')

  const today = new Date().toISOString().slice(0, 10)
  const periodInvalid = Boolean(startDate && endDate && endDate < startDate)
  const canSubmit =
    equipmentId !== '' && quantity > 0 && startDate !== '' && endDate !== '' && !periodInvalid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting || !currentUser) return

    setSubmitting(true)
    setError(null)

    try {
      // Le clientId n'est pas transmis : le backend l'établit depuis le jeton.
      const created = await quoteRequestsClient.create({
        equipmentId,
        quantity,
        startDate,
        endDate,
        message: message.trim(),
        clientName: currentUser.name,
        clientPhone: currentUser.phone ?? '',
        clientEmail: currentUser.email,
      })
      navigate(`/client/demandes/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "La demande n'a pas pu être envoyée")
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <div className="space-y-6">
      <Link
        to="/client/demandes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={15} />
        Mes demandes
      </Link>

      <PageTitle
        title="Nouvelle demande de devis"
        subtitle="Le fournisseur vous répondra avec une offre chiffrée"
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="equipment" className="mb-1.5 block text-sm font-medium text-slate-900">
              Équipement <span className="text-red-500">*</span>
            </label>
            <select
              id="equipment"
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Sélectionnez un équipement</option>
              {publishedEquipment.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}{e.level ? ` — ${e.level}` : ''}
                </option>
              ))}
            </select>
            {publishedEquipment.length === 0 && (
              <p className="mt-1.5 text-xs text-slate-500">
                Aucun équipement publié n'est disponible pour le moment.
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-slate-900">
                Quantité <span className="text-red-500">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="start" className="mb-1.5 block text-sm font-medium text-slate-900">
                Début <span className="text-red-500">*</span>
              </label>
              <input
                id="start"
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="end" className="mb-1.5 block text-sm font-medium text-slate-900">
                Fin <span className="text-red-500">*</span>
              </label>
              <input
                id="end"
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {periodInvalid && (
            <p className="text-sm text-red-600">La date de fin précède la date de début.</p>
          )}

          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-900">
              Précisions sur votre besoin
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Lieu du chantier, contraintes d'accès, opérateur souhaité…"
              className={`${inputClass} resize-y`}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Plus votre besoin est précis, plus l'offre du fournisseur sera juste.
            </p>
          </div>

          {error && (
            <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              to="/client/demandes"
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {submitting ? 'Envoi…' : 'Envoyer la demande'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
