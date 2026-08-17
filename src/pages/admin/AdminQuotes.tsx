import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, PageTitle, QuoteStatusBadge, Toast } from '../../components/ui'

export default function AdminQuotes() {
  const { quoteRequests, equipment, users, updateQuoteRequestStatus, assignInspection } = useStore()
  const technicians = users.filter((u) => u.role === 'TECHNICAL')
  const [selectedTech, setSelectedTech] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <Link to="/admin-dashboard" className="text-sm font-medium text-brand-600 hover:underline">← Retour au tableau de bord</Link>
      <div className="mt-2">
        <PageTitle
          title="Demandes de devis"
          subtitle={`${quoteRequests.length} demande(s) reçue(s) des clients`}
        />
      </div>

      {quoteRequests.length === 0 ? (
        <EmptyState title="Aucune demande" subtitle="Les demandes de devis des clients apparaîtront ici." />
      ) : (
        <div className="grid gap-4">
          {quoteRequests.map((qr) => {
            const eq = equipment.find((e) => e.id === qr.equipmentId)
            const supplier = users.find((u) => u.id === qr.supplierId)
            const tech = selectedTech[qr.id] ?? technicians[0]?.id ?? ''
            return (
              <Card key={qr.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">{qr.reference}</h3>
                      <QuoteStatusBadge status={qr.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Équipement :{' '}
                      <Link to={`/equipment/${qr.equipmentId}`} className="font-semibold text-brand-600 hover:underline">
                        {eq?.name ?? 'Équipement'}
                      </Link>
                    </p>
                    <p className="text-sm text-slate-600">Client : {qr.clientName} ({qr.clientCompany})</p>
                    <p className="text-sm text-slate-600">Fournisseur : {supplier?.company}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {qr.duration} · {qr.requestedDate} · <img src="/assets/check.svg" alt="📍" className="w-3 h-3 inline" /> {qr.location}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {qr.status === 'NOUVELLE' && (
                      <button
                        onClick={() => {
                          updateQuoteRequestStatus(qr.id, 'TRANSMISE')
                          showToast(`${qr.reference} transmise au fournisseur <img src="/assets/check.svg" alt="✔" className="w-3 h-3 inline" />`)
                        }}
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                      >
                        <img src="/assets/check.svg" alt="📩" className="w-4 h-4 inline mr-1" />Transmettre au fournisseur
                      </button>
                    )}
                    {(qr.status === 'NOUVELLE' || qr.status === 'TRANSMISE') && (
                      <div className="flex items-center gap-2">
                        <select
                          value={tech}
                          onChange={(e) => setSelectedTech((prev) => ({ ...prev, [qr.id]: e.target.value }))}
                          className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                        >
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>{t.company}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            assignInspection(qr.id, tech)
                            showToast(`Inspection assignée pour ${qr.reference} <img src="/assets/check.svg" alt="✔" className="w-3 h-3 inline" />`)
                          }}
                          disabled={!tech}
                          className="rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
                        >
                          <img src="/assets/check.svg" alt="🔍" className="w-4 h-4 inline mr-1" />Assigner l'inspection
                        </button>
                      </div>
                    )}
                    {qr.status === 'EN_INSPECTION' && (
                      <Link to="/admin/inspections" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                        Suivre l'inspection
                      </Link>
                    )}
                    {qr.status === 'RAPPORT_REÇU' && (
                      <Link to={`/admin/validate/${qr.id}`} className="rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-600">
                        <img src="/assets/check.svg" alt="📊" className="w-4 h-4 inline mr-1" />Valider le rapport
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <Toast message={toast} />
    </div>
  )
}
