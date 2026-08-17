/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import type { Equipment, EquipmentTier } from '../store/types'
import { CategoryBadge } from './ui'

export const TIER_ORDER: Record<EquipmentTier, number> = { GOLD: 0, SILVER: 1, BASIC: 2 }

const FALLBACK_IMG =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%2364748b%22%3EÉquipement%3C/text%3E%3C/svg%3E'

export function onImgError(img: React.SyntheticEvent<HTMLImageElement>) {
  ;(img.target as HTMLImageElement).src = FALLBACK_IMG
}

export function TierBadge({ tier, size = 'sm' }: { tier: EquipmentTier; size?: 'sm' | 'lg' }) {
  const base =
    size === 'lg'
      ? 'px-4 py-1.5 text-sm tracking-widest'
      : 'px-2.5 py-0.5 text-[10px] tracking-wider'
  if (tier === 'GOLD') {
    return (
      <span
        className={`tier-gold relative inline-flex items-center gap-1 overflow-hidden rounded-full font-extrabold uppercase text-amber-900 shadow-md ${base}`}
      >
        <img src="/assets/star.svg" alt="Gold" className="w-4 h-4" /> Gold
      </span>
    )
  }
  if (tier === 'SILVER') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 font-bold uppercase text-slate-700 shadow-sm ring-1 ring-slate-300 ${base}`}
      >
        Silver
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center rounded-full bg-slate-100 font-semibold uppercase text-slate-500 ring-1 ring-slate-200 ${base}`}
    >
      Basic
    </span>
  )
}

export function StarRating({ value, count, compact = false }: { value: number; count?: number; compact?: boolean }) {
  if (!count) return <span className="text-xs text-slate-400">Pas encore d'avis</span>
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <img src="/assets/star.svg" alt="★" className="w-4 h-4 text-amber-500" />
      <span className="font-semibold text-slate-800">{value.toFixed(1)}</span>
      {!compact && <span className="text-xs text-slate-500">({count} avis)</span>}
    </span>
  )
}

export function LikeButton({
  equipmentId,
  likes,
  className = '',
}: {
  equipmentId: string
  likes: number
  className?: string
}) {
  const { likedIds, toggleLike } = useStore()
  const liked = likedIds.includes(equipmentId)
  const [pop, setPop] = useState(false)

  return (
    <button
      aria-label={liked ? 'Retirer le like' : 'Aimer cet équipement'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleLike(equipmentId)
        setPop(true)
        setTimeout(() => setPop(false), 400)
      }}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold transition ${
        liked
          ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
          : 'bg-white/90 text-slate-600 ring-1 ring-slate-200 hover:text-rose-500'
      } ${className}`}
    >
      <img src={liked ? '/assets/heart.svg' : '/assets/heart-empty.svg'} alt={liked ? '♥' : '♡'} className={`inline-block w-4 h-4 ${pop ? 'animate-heart-pop' : ''}`} />
      <span>{likes}</span>
    </button>
  )
}

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export function ProductCard({
  equipment: e,
  onQuote,
}: {
  equipment: Equipment
  onQuote?: (equipmentId: string) => void
}) {
  const { users, categories, getRating } = useStore()
  const navigate = useNavigate()
  const supplier = users.find((u) => u.id === e.supplierId)
  const cat = categories.find((c) => c.id === e.categoryId)
  const rating = getRating(e.id)
  const gold = e.tier === 'GOLD'

  return (
    <div
      className={`product-card group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
        gold
          ? 'border-amber-200 shadow-md ring-1 ring-amber-100 hover:shadow-amber-200/60'
          : e.tier === 'SILVER'
            ? 'border-slate-200 shadow-sm'
            : 'border-slate-100 shadow-sm'
      }`}
    >
      <Link to={`/equipment/${e.id}`} className="relative block h-44 overflow-hidden bg-slate-100">
        <img
          src={e.photos[0]}
          alt={e.name}
          onError={onImgError}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <TierBadge tier={e.tier} />
          <LikeButton equipmentId={e.id} likes={e.likes} />
        </div>
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-xs font-semibold text-white transition-transform duration-300 group-hover:translate-y-0">
          Voir le matériel →
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/equipment/${e.id}`} className="font-bold text-slate-900 transition hover:text-brand-600">
          {e.name}
        </Link>
        <p className="mt-0.5 text-xs text-slate-500">
          {cat?.name} • {e.brand} {e.model}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <StarRating value={rating.average} count={rating.count} />
        </div>

        {gold && (
          <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-500">
            <span>{e.hours.toLocaleString('fr-FR')} h</span>
            <span>{e.year}</span>
            <span>{e.declaredCondition}</span>
            {e.category && <span>Cat. {e.category}</span>}
          </div>
        )}

        <div className="mt-3 flex flex-1 flex-col justify-end gap-1 text-xs text-slate-600">
          <span>Fournisseur : {supplier?.company}</span>
          <span className="flex items-center gap-2">
            {e.location.split(',')[0]}
            {e.status === 'DISPONIBLE' || e.status === 'CATEGORISE' ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Disponible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> En inspection
              </span>
            )}
          </span>
          {e.category && (
            <span className="mt-1">
              <CategoryBadge category={e.category} />
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to={`/equipment/${e.id}`}
            className="rounded-lg border border-brand-200 py-2 text-center text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Voir le matériel
          </Link>
          <button
            onClick={() => (onQuote ? onQuote(e.id) : navigate(`/equipment/${e.id}`))}
            className="rounded-lg bg-accent-500 py-2 text-xs font-bold text-white transition hover:bg-accent-600 active:scale-95"
          >
            Demander devis
          </button>
        </div>
      </div>
    </div>
  )
}
