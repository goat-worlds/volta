import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  BadgeCheck, Calendar, CheckCircle2, Gauge, HardHat, MapPin, Wrench, XCircle,
} from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, LevelBadge, Modal, fmtPrice } from '../../components/ui'
import { useToast } from '../../components/feedback/Toaster'

export default function EquipmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { equipment, categories, users, currentUser, createQuoteRequest } = useStore()
  const eq = equipment.find((e) => e.id === id)
  const [modalOpen, setModalOpen] = useState(false)
  const toast = useToast()
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    quantity: 1,
    message: '',
  })

  if (!eq || eq.status !== 'PUBLISHED') {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-12">
        <EmptyState title="Engin introuvable ou non publié" subtitle="Seuls les engins publiés sont visibles dans le catalogue." />
        <div className="mt-4 text-center">
          <Link to="/catalogue" className="font-medium text-blue-600 hover:underline">← Retour au catalogue</Link>
        </div>
      </div>
    )
  }

  const cat = categories.find((c) => c.id === eq.categoryId)
  const supplier = users.find((u) => u.id === eq.supplierId)

  const handleQuoteClick = () => {
    if (!currentUser) {
      navigate('/connexion')
      return
    }
    if (currentUser.role !== 'CLIENT') {
      toast.warning('Action réservée aux clients', 'Seul un compte client peut demander un devis.')
      return
    }
    setModalOpen(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    setSending(true)
    try {
      await createQuoteRequest({
        equipmentId: eq.id,
        clientId: currentUser.id,
        startDate: form.startDate,
        endDate: form.endDate,
        quantity: form.quantity,
        message: form.message,
        clientName: currentUser.name,
        clientPhone: currentUser.phone,
        clientEmail: currentUser.email,
      })
      setModalOpen(false)
      toast.success('Demande de devis envoyée', 'VOLTA qualifie votre demande et revient vers vous avec une proposition.')
    } catch (err) {
      toast.fromError(err, 'Demande non envoyée')
    } finally {
      setSending(false)
    }
  }

  const input = 'w-full rounded-lg border border-papier-200 p-2 text-sm'

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <Link to="/catalogue" className="text-sm font-medium text-blue-600 hover:underline">← Retour au catalogue</Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <img loading="lazy" src={eq.photos[0]} alt={eq.name} className="h-80 w-full rounded-xl object-cover" />
          <div className="mt-2 flex gap-2">
            {eq.photos.map((p, i) => (
              <img loading="lazy" key={i} src={p} alt="" className="h-16 w-24 rounded-lg object-cover" />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{eq.name}</h1>
            <LevelBadge level={eq.level} />
          </div>
          <div className="mt-1 text-sm text-papier-600">
            {cat?.name} · {eq.brand} {eq.model}
          </div>
          <div className="mt-3 text-2xl font-bold text-blue-700">{fmtPrice(eq.pricePerDay)} / jour</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Card className="flex items-center gap-2 p-3">
              <MapPin size={15} className="shrink-0 text-papier-600" />
              {eq.location}
            </Card>
            <Card className="flex items-center gap-2 p-3">
              <Calendar size={15} className="shrink-0 text-papier-600" />
              Année : {eq.year}
            </Card>
            <Card className="flex items-center gap-2 p-3">
              <Gauge size={15} className="shrink-0 text-papier-600" />
              {eq.hours.toLocaleString('fr-FR')} h compteur
            </Card>
            <Card className="flex items-center gap-2 p-3">
              <Wrench size={15} className="shrink-0 text-papier-600" />
              {eq.declaredCondition}
            </Card>
            <Card className="flex items-center gap-2 p-3">
              {eq.available ? (
                <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              ) : (
                <XCircle size={15} className="shrink-0 text-red-500" />
              )}
              {eq.available ? 'Disponible' : 'Indisponible'}
            </Card>
            <Card className="flex items-center gap-2 p-3">
              <HardHat size={15} className="shrink-0 text-papier-600" />
              {eq.withOperator ? 'Avec opérateur' : 'Sans opérateur'}
            </Card>
          </div>
          <p className="mt-4 text-sm text-papier-600">{eq.description}</p>
          <Card className="mt-4 p-4 text-sm">
            <div className="font-semibold">Fournisseur</div>
            <div className="mt-1 text-papier-600">{supplier?.company} — {supplier?.city}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600">
              <BadgeCheck size={14} />
              Fournisseur vérifié VOLTA
            </div>
          </Card>
          {/* Une seule action, et c'est VOLTA qui répond. La fiche proposait
              aussi « Contacter le fournisseur », qui ouvrait ses coordonnées
              directes : le client partait négocier hors plateforme, et VOLTA
              sortait du circuit dès la première page. La demande passe
              désormais par VOLTA, qui qualifie et revient vers le client. */}
          <div className="mt-5">
            <button
              onClick={handleQuoteClick}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Demander un devis
            </button>
            <p className="mt-2 text-center text-xs text-papier-600">
              Décrivez votre besoin en quelques champs. VOLTA le confronte à son réseau d’engins vérifiés.
            </p>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Demande de devis — ${eq.name}`}>
        <form onSubmit={submit} className="grid gap-3">
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Votre demande est traitée par VOLTA. Vous consulterez la réponse dans votre espace, rubrique Devis.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-papier-600">Date de début *</label>
              <input required type="date" className={input} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-papier-600">Date de fin *</label>
              <input required type="date" className={input} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-papier-600">Quantité *</label>
            <input required type="number" min="1" className={input} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-papier-600">Message ou détails supplémentaires</label>
            <textarea className={input} rows={2} placeholder="Ex: conditions d'accès, contraintes spéciales..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="mt-2 rounded-lg bg-amber-500 py-2.5 font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {sending ? 'Envoi en cours…' : 'Envoyer la demande de devis'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
