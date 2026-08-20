import { useStore } from '../store/StoreContext'
import { StarRating } from './product'
import { IconStar, IconCheck } from './Icons'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} filled={i < rating} className={`w-4 h-4 ${i < rating ? 'text-amber-500' : 'text-slate-300'}`} />
      ))}
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
            <div key={r.id} className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-md transition hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <Stars rating={r.rating} />
                <span className="text-xs text-slate-500 font-medium">{r.date}</span>
              </div>
              <p className="text-sm italic text-slate-700 leading-relaxed">« {r.comment} »</p>
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white text-sm">
                    {r.author.charAt(0)}
                  </span>
                  <span className="font-semibold text-slate-800 text-sm">{r.author}</span>
                </div>
                {r.verified && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-300 text-xs">
                    <IconCheck className="w-3.5 h-3.5" />
                    Vérifié
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
