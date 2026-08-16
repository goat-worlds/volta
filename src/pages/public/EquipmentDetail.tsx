import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, LevelBadge, Modal, Toast, fmtPrice } from '../../components/ui'

export default function EquipmentDetail() {
  const { id } = useParams()
  const { equipment, categories, users, createRentalRequest } = useStore()
  const eq = equipment.find((e) => e.id === id)
  const [modalOpen, setModalOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    location: '',
    withOperator: false,
    transport: false,
    comment: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      const req = createRentalRequest({ ...form, equipmentId: eq.id })
      setSending(false)
      setModalOpen(false)
      setToast(`Demande de devis ${req.reference} envoyée ! Le fournisseur et VOLTA ont été notifiés.`)
      setTimeout(() => setToast(null), 5000)
    }, 600)
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
          <div className="mt-1 text-sm text-slate-700">
            {cat?.name} · {eq.brand} {eq.model}
          </div>
          <div className="mt-3 text-2xl font-bold text-blue-700">{fmtPrice(eq.pricePerDay)} / jour</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Card className="p-3">📍 {eq.location}</Card>
            <Card className="p-3">📅 Année : {eq.year}</Card>
            <Card className="p-3">⏱️ {eq.hours.toLocaleString('fr-FR')} h compteur</Card>
            <Card className="p-3">🔧 {eq.declaredCondition}</Card>
            <Card className="p-3">{eq.available ? '✅ Disponible' : '❌ Indisponible'}</Card>
            <Card className="p-3">{eq.withOperator ? '👷 Avec opérateur' : 'Sans opérateur'}</Card>
          </div>
          <p className="mt-4 text-sm text-slate-600">{eq.description}</p>
          <Card className="mt-4 p-4 text-sm">
            <div className="font-semibold">Fournisseur</div>
            <div className="mt-1 text-slate-600">{supplier?.company} — {supplier?.city}</div>
            <div className="text-xs text-emerald-600">✔ Fournisseur vérifié VOLTA</div>
          </Card>
          <div className="mt-5 grid gap-2">
            <button
              onClick={() => setContactOpen(true)}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Contacter le fournisseur
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="w-full rounded-lg border border-blue-600 py-3 font-semibold text-blue-600 hover:bg-blue-50"
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
            <div className="mt-1 text-slate-600">👤 {supplier?.name}</div>
            <div className="text-slate-600">📍 {supplier?.city}</div>
            <div className="text-slate-600">📞 {supplier?.phone}</div>
            <div className="text-slate-600">✉️ {supplier?.email}</div>
            <div className="mt-2 text-xs text-emerald-600">✔ Fournisseur vérifié VOLTA</div>
          </Card>
          <p className="text-xs text-slate-700">
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
              <label className="mb-1 block text-xs font-medium text-slate-700">Date de début *</label>
              <input required type="date" className={input} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Date de fin *</label>
              <input required type="date" className={input} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Lieu d'utilisation *</label>
            <input required className={input} placeholder="ex : Chantier Abidjan Nord" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.withOperator} onChange={(e) => setForm({ ...form, withOperator: e.target.checked })} />
              Avec opérateur
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.transport} onChange={(e) => setForm({ ...form, transport: e.target.checked })} />
              Transport inclus
            </label>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Commentaire</label>
            <textarea className={input} rows={2} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Nom *</label>
              <input required className={input} value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Téléphone *</label>
              <input required className={input} value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Email *</label>
            <input required type="email" className={input} value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="mt-2 rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {sending ? 'Envoi en cours…' : 'Envoyer la demande de devis'}
          </button>
        </form>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}
