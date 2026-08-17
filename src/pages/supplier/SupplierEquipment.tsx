import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, PageTitle, QuoteStatusBadge } from '../../components/ui'

const SUPPLIER_ID = 'u-sup-1'

export default function SupplierEquipment() {
  const { quoteRequests, equipment } = useStore()
  const myRequests = quoteRequests.filter((qr) => qr.supplierId === SUPPLIER_ID)
  const myEquipment = equipment.filter((e) => e.supplierId === SUPPLIER_ID)

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <PageTitle
        title="Gestion des équipements et demandes"
        subtitle={`${myEquipment.length} équipement(s) · ${myRequests.length} demande(s) en attente`}
        actions={
          <Link
            to="/supplier/equipment/new"
            className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition"
          >
            + Ajouter équipement
          </Link>
        }
      />

      {/* Mes équipements */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-4"><img src="/assets/check.svg" alt="🚜" className="w-5 h-5 inline mr-2" />Mes équipements</h2>
        {myEquipment.length === 0 ? (
          <Card className="p-8 text-center bg-slate-50">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-600 font-medium">Vous n'avez pas encore d'équipements listés</p>
            <p className="text-sm text-slate-500 mt-1">Cliquez sur "Ajouter équipement" pour commencer</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {myEquipment.map((eq) => (
              <Card key={eq.id} className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-lg">{eq.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        eq.status === 'CATEGORISE' ? 'bg-emerald-100 text-emerald-700' :
                        eq.status === 'EN_INSPECTION' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {eq.status === 'DISPONIBLE' && '<img src="/assets/check.svg" alt="✓" className="w-3 h-3 inline mr-1" />Disponible'}
                        {eq.status === 'EN_INSPECTION' && '<img src="/assets/loading.svg" alt="⏳" className="w-3 h-3 inline mr-1 animate-spin" />En inspection'}
                        {eq.status === 'CATEGORISE' && '<img src="/assets/check.svg" alt="✔" className="w-3 h-3 inline mr-1" />Catégorisé'}
                        {eq.status === 'INDISPONIBLE' && '<img src="/assets/close.svg" alt="✗" className="w-3 h-3 inline mr-1" />Indisponible'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{eq.brand} {eq.model} • {eq.year} • {eq.hours}h</p>
                    {eq.category && (
                      <p className="text-sm text-slate-600 mt-2">
                        Catégorie VOLTA: <span className="font-bold">{eq.category}</span>
                        {eq.rating && ` • Note: ${eq.rating === 'GOLD' ? '<img src="/assets/star.svg" alt="⭐" className="w-4 h-4 inline" /> Or' : eq.rating === 'SILVER' ? '<img src="/assets/check.svg" alt="✓" className="w-3 h-3 inline mr-1" />Argent' : 'Standard'}`}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/equipment/${eq.id}`}
                    className="px-4 py-2 rounded-lg text-brand-600 border-2 border-brand-600 hover:bg-brand-50 transition font-medium"
                  >
                    Voir
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Demandes de devis */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4"><img src="/assets/check.svg" alt="📋" className="w-5 h-5 inline mr-2" />Demandes de devis reçues</h2>

        {myRequests.length === 0 ? (
          <Card className="p-8 text-center bg-slate-50">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-600 font-medium">Aucune demande</p>
            <p className="text-sm text-slate-500 mt-1">Les clients qui vous demandent un devis apparaîtront ici.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {myRequests.map((qr) => {
              const eq = equipment.find((e) => e.id === qr.equipmentId)
              return (
                <Card key={qr.id} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900">{qr.reference}</h3>
                        <QuoteStatusBadge status={qr.status} />
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Équipement:{' '}
                        <Link to={`/equipment/${qr.equipmentId}`} className="font-semibold text-brand-600 hover:underline">
                          {eq?.name}
                        </Link>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Client</p>
                      <p className="font-semibold text-slate-900">{qr.clientName}</p>
                      <p className="text-sm text-slate-600">{qr.clientCompany}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Contact</p>
                      <p className="text-sm">
                        <a href={`tel:${qr.clientPhone}`} className="text-brand-600 hover:underline">
                          <img src="/assets/check.svg" alt="📞" className="w-3 h-3 inline mr-1" />{qr.clientPhone}
                        </a>
                      </p>
                      <p className="text-sm">
                        <a href={`mailto:${qr.clientEmail}`} className="text-brand-600 hover:underline">
                          <img src="/assets/check.svg" alt="📧" className="w-3 h-3 inline mr-1" />{qr.clientEmail}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Durée demandée</p>
                      <p className="font-semibold text-slate-900">{qr.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Localisation</p>
                      <p className="font-semibold text-slate-900">{qr.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Date demandée</p>
                      <p className="font-semibold text-slate-900">{qr.requestedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Créée le</p>
                      <p className="font-semibold text-slate-900">{new Date(qr.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>

                  {qr.message && (
                    <div className="mb-4 p-3 bg-brand-50 rounded-lg border border-brand-200">
                      <p className="text-xs text-brand-700 font-semibold mb-1">Message du client</p>
                      <p className="text-sm text-slate-700">{qr.message}</p>
                    </div>
                  )}

                  <div className="text-xs text-slate-500">
                    <img src="/assets/check.svg" alt="💡" className="w-3 h-3 inline mr-1" />Contactez le client directement pour négocier les tarifs et conditions.
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
