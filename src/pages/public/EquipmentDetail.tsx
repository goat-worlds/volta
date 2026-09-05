import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  BadgeCheck, Calendar, CheckCircle2, Gauge, HardHat, Mail, MapPin, Phone, User, Wrench, XCircle,
} from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, LevelBadge, Modal, Toast, fmtPrice } from '../../components/ui'

export default function EquipmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { equipment, categories, users, currentUser, createQuoteRequest } = useStore()
  const eq = equipment.find((e) => e.id === id)
  const [modalOpen, setModalOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
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
      setToast('Seuls les clients peuvent demander des devis.')
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
      setToast('Demande de devis envoyée ! Le fournisseur a été notifié.')
      setTimeout(() => setToast(null), 5000)
    } finally {
      setSending(false)
    }
  }

  const input = 'w-full rounded-lg border border-slate-300 p-2 text-sm'

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <Link to="/catalogue" className="text-sm font-medium text-blue-600 hover:underline">← Retour au catalogue</Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <img src={eq.photos[0]} alt={eq.name} className="h-80 w-full rounded-xl object-cover" />
          <div className="mt-2 flex gap-2">
            {eq.photos.map((p, i) => (
              <img key={i} src={p} alt="" className="h-16 w-24 rounded-lg object-cover" />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{eq.name}</h1>
            <LevelBadge level={eq.level} />
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {cat?.name} · {eq.brand} {eq.model}
          </div>
          <div className="mt-3 text-2xl font-bold text-blue-700">{fmtPrice(eq.pricePerDay)} / jour</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Card className="flex items-center gap-2 p-3">
              <MapPin size={15} className="shrink-0 text-slate-400" />
              {eq.location}
            </Card>
            <Card className="flex items-center gap-2 p-3">
              <Calendar size={15} className="shrink-0 text-slate-400" />
              Année : {eq.year}
            </Card>
            <Card className="flex items-center gap-2 p-3">
              <Gauge size={15} className="shrink-0 text-slate-400" />
              {eq.hours.toLocaleString('fr-FR')} h compteur
            </Card>
            <Card className="flex items-center gap-2 p-3">
              <Wrench size={15} className="shrink-0 text-slate-400" />
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
              <HardHat size={15} className="shrink-0 text-slate-400" />
              {eq.withOperator ? 'Avec opérateur' : 'Sans opérateur'}
            </Card>
          </div>
          <p className="mt-4 text-sm text-slate-600">{eq.description}</p>
          <Card className="mt-4 p-4 text-sm">
            <div className="font-semibold">Fournisseur</div>
            <div className="mt-1 text-slate-600">{supplier?.company} — {supplier?.city}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600">
              <BadgeCheck size={14} />
              Fournisseur vérifié VOLTA
            </div>
          </Card>
          <div className="mt-5 grid gap-2">
            <button
              onClick={() => setContactOpen(true)}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Contacter le fournisseur
            </button>
            <button
              onClick={handleQuoteClick}
              className="w-full rounded-lg border border-amber-400 bg-amber-50 py-3 font-semibold text-amber-700 hover:bg-amber-100"
            >
              Demander un devis
            </button>
          </div>
        </div>
      </div>

      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title={`Contacter le fournisseur — ${supplier?.company}`}>
        <div className="grid gap-3 text-sm">
          <Card className="p-4">
            <div className="font-semibold">{supplier?.company}</div>
            <div className="mt-1 flex items-center gap-2 text-slate-600">
              <User size={14} className="shrink-0 text-slate-400" />
              {supplier?.name}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin size={14} className="shrink-0 text-slate-400" />
              {supplier?.city}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone size={14} className="shrink-0 text-slate-400" />
              {supplier?.phone}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail size={14} className="shrink-0 text-slate-400" />
              {supplier?.email}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
              <BadgeCheck size={14} />
              Fournisseur vérifié VOLTA
            </div>
          </Card>
          <p className="text-xs text-slate-500">
            VOLTA met en relation : contactez directement le fournisseur pour discuter de vos besoins. Aucune réservation ni paiement ne passe par la plateforme.
          </p>
          <button
            onClick={() => setContactOpen(false)}
            className="rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Fermer
          </button>
        </div>
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Demande de devis — ${eq.name}`}>
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Date de début *</label>
              <input required type="date" className={input} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Date de fin *</label>
              <input required type="date" className={input} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Quantité *</label>
            <input required type="number" min="1" className={input} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Message ou détails supplémentaires</label>
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
      <Toast message={toast} />
    </div>
  )
}
