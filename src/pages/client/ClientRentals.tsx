import { useMemo, useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, PageTitle, RentalStatusBadge } from '../../components/ui'
import { RENTAL_STATUS } from '../../lib/statuses'

/**
 * Locations du client.
 *
 * Elles naissent de l'acceptation d'un devis : le backend crée la demande de
 * location dans la même transaction, ce qui garantit qu'aucun devis accepté ne
 * reste sans location correspondante.
 *
 * Le filtrage se fait sur l'email plutôt que sur un identifiant client :
 * RentalRequest porte les coordonnées du demandeur, pas son clientId. C'est une
 * limite du modèle actuel, pas un choix — un même client changeant d'email
 * perdrait le lien avec ses locations passées.
 */
export default function ClientRentals() {
  const { currentUser, rentalRequests, equipment } = useStore()
  const [filter, setFilter] = useState<'all' | 'open' | 'active' | 'closed'>('all')

  const mine = useMemo(() => {
    if (!currentUser) return []
    return rentalRequests
      .filter((r) => r.clientId === currentUser.id || r.clientEmail === currentUser.email)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [rentalRequests, currentUser])

  const equipmentName = (id: string) => equipment.find((e) => e.id === id)?.name ?? 'Équipement'
  // Trois moments du parcours : en attente d'une décision, en cours
  // d'exécution, terminée d'une façon ou d'une autre.
  const bucket = (status: string) =>
    RENTAL_STATUS[status as keyof typeof RENTAL_STATUS]?.terminal
      ? 'closed'
      : status === 'IN_PROGRESS' || status === 'CONFIRMED'
        ? 'active'
        : 'open'
  const visible = filter === 'all' ? mine : mine.filter((r) => bucket(r.status) === filter)

  const tabs: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'open', label: 'En attente' },
    { key: 'active', label: 'Confirmées / en cours' },
    { key: 'closed', label: 'Terminées' },
  ]

  return (
    <div className="space-y-6">
      <PageTitle
        title="Mes locations"
        subtitle="Les réservations issues de vos devis acceptés"
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const count = t.key === 'all' ? mine.length : mine.filter((r) => bucket(r.status) === t.key).length
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === t.key
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {t.label} <span className="opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={filter === 'all' ? 'Aucune location' : 'Aucune location dans cette catégorie'}
          subtitle={
            filter === 'all'
              ? 'Une location est créée automatiquement lorsque vous acceptez un devis.'
              : 'Changez de filtre pour voir vos autres locations.'
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Référence</th>
                  <th className="px-5 py-3 font-medium">Équipement</th>
                  <th className="px-5 py-3 font-medium">Période</th>
                  <th className="px-5 py-3 font-medium">Lieu</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((r) => (
                  <tr key={r.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{r.reference}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{equipmentName(r.equipmentId)}</td>
                    <td className="px-5 py-3 text-slate-600">{r.startDate} → {r.endDate}</td>
                    <td className="px-5 py-3 text-slate-600">{r.location || '—'}</td>
                    <td className="px-5 py-3"><RentalStatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-slate-100 md:hidden">
            {visible.map((r) => (
              <li key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{equipmentName(r.equipmentId)}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">{r.reference}</p>
                  </div>
                  <RentalStatusBadge status={r.status} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {r.startDate} → {r.endDate}
                  {r.location ? ` · ${r.location}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
