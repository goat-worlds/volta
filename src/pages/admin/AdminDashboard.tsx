import { useStore } from '../../store/StoreContext'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import AdminHeader from '../../components/Admin/AdminHeader'
import StatCard from '../../components/Admin/StatCard'
import { CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { equipment, currentUser } = useStore()

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Accès refusé. Vous n'êtes pas administrateur.</p>
      </div>
    )
  }

  const publishedCount = equipment.filter((e) => e.status === 'PUBLISHED').length
  const pendingCount = equipment.filter((e) => e.status === 'SUBMITTED' || e.status === 'PENDING_INSPECTION').length
  const totalEquipment = equipment.length

  const pendingEquipment = equipment.filter((e) => e.status === 'SUBMITTED' || e.status === 'PENDING_INSPECTION').slice(0, 5)

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <AdminHeader />

        <main className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard icon={null} label="Équipements totaux" value={totalEquipment} color="blue" />
            <StatCard icon={null} label="Équipements publiés" value={publishedCount} color="green" />
            <StatCard icon={null} label="En attente de vérif." value={pendingCount} color="yellow" />
            <StatCard icon={null} label="Fournisseurs actifs" value={12} color="yellow" />
          </div>

          <section className="mt-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Équipements en attente de vérification</h2>
              <Link to="/admin/equipment" className="text-sm font-semibold text-yellow-600 hover:text-yellow-700">
                Voir tous →
              </Link>
            </div>

            {pendingEquipment.length > 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Engin</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Fournisseur</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Statut</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pendingEquipment.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{e.name}</div>
                          <div className="text-xs text-slate-500">{e.id}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{e.supplierId}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            e.status === 'SUBMITTED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {e.status === 'SUBMITTED' ? 'Soumis' : 'Inspection en cours'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link
                              to={`/admin/equipment`}
                              className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
                            >
                              Vérifier
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <p className="mt-3 font-medium text-slate-900">Tout est à jour!</p>
                <p className="mt-1 text-sm text-slate-600">Aucun équipement en attente de vérification.</p>
              </div>
            )}
          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-bold text-slate-900">Équipements récemment publiés</h3>
              <div className="mt-4 space-y-3">
                {equipment
                  .filter((e) => e.status === 'PUBLISHED')
                  .slice(0, 3)
                  .map((e) => (
                    <div key={e.id} className="border-t border-slate-200 pt-3">
                      <p className="font-medium text-slate-900">{e.name}</p>
                      <p className="text-xs text-slate-500">{e.location}</p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-bold text-slate-900">Statistiques d'utilisation</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Taux de publication</span>
                  <span className="font-bold text-slate-900">{totalEquipment > 0 ? Math.round((publishedCount / totalEquipment) * 100) : 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition"
                    style={{
                      width: `${totalEquipment > 0 ? (publishedCount / totalEquipment) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
