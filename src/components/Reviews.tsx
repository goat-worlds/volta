import { useStore } from '../store/StoreContext'
import { StarRating } from './product'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500">
      {'★'.repeat(rating)}
      <span className="text-slate-300">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

export default function Reviews({ equipmentId }: { equipmentId: string }) {
  const { getReviews, getRating } = useStore()
  const reviews = getReviews(equipmentId)
  const rating = getRating(equipmentId)

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-bold text-slate-900">Avis et commentaires</h2>
        <StarRating value={rating.average} count={rating.count} />
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-slate-500">Aucun avis pour le moment.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <Stars rating={r.rating} />
                <span className="text-xs text-slate-400">{r.date}</span>
              </div>
              <p className="mt-2 text-sm italic text-slate-700">« {r.comment} »</p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                  {r.author.charAt(0)}
                </span>
                <span className="font-semibold text-slate-800">{r.author}</span>
                {r.verified && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600 ring-1 ring-emerald-200">
                    ✓ Client vérifié
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
