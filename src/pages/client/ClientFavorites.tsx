import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { EmptyState, PageTitle } from '../../components/ui'
import EquipmentCard from '../../components/EquipmentCard'

/**
 * Sélection du client.
 *
 * Le menu proposait « Favoris » sans page derrière : la zone de contenu restait
 * blanche. Les engins retirés du catalogue depuis la mise en favori sont
 * écartés silencieusement — afficher une carte qui mène à une fiche disparue
 * serait pire qu'une liste plus courte.
 */
export default function ClientFavorites() {
  const { favorites, equipment } = useStore()

  const saved = favorites
    .map((id) => equipment.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))

  return (
    <div>
      <PageTitle
        title="Mes favoris"
        subtitle={
          saved.length === 0
            ? 'Les engins que vous mettez de côté se retrouvent ici.'
            : `${saved.length} engin${saved.length > 1 ? 's' : ''} mis de côté.`
        }
      />

      {saved.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Aucun favori"
          subtitle="Parcourez le catalogue et touchez le cœur sur un engin pour le retrouver ici."
          action={
            <Link
              to="/client/catalogue"
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500"
            >
              Parcourir le catalogue
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((e) => (
            <EquipmentCard
              key={e.id}
              id={e.id}
              name={e.name}
              image={e.photos[0]}
              location={e.location}
              price={e.pricePerDay}
              level={e.level ?? undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
