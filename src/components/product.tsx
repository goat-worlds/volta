/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import type { Equipment, EquipmentTier } from '../store/types'
import { CategoryBadge } from './ui'
import { IconStar, IconHeart, IconMapPin, IconCheck, IconBuilding, IconClose } from './Icons'

export const TIER_ORDER: Record<EquipmentTier, number> = { GOLD: 0, SILVER: 1, BASIC: 2 }

const FALLBACK_IMG =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%2364748b%22%3EÉquipement%3C/text%3E%3C/svg%3E'

export function onImgError(img: React.SyntheticEvent<HTMLImageElement>) {
  ;(img.target as HTMLImageElement).src = FALLBACK_IMG
}

export function TierBadge({ tier, size = 'sm' }: { tier: EquipmentTier; size?: 'sm' | 'lg' }) {
  const base =
    size === 'lg'
      ? 'px-4 py-2 text-sm tracking-widest'
      : 'px-3 py-1 text-[10px] tracking-wider'
  if (tier === 'GOLD') {
    return (
      <span
        className={`tier-gold relative inline-flex items-center gap-2 overflow-hidden rounded-full font-extrabold uppercase bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 shadow-lg ring-2 ring-amber-300 ${base}`}
      >
        <IconStar filled className="w-4 h-4" />
        Gold
      </span>
    )
  }
  if (tier === 'SILVER') {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 font-bold uppercase text-slate-800 shadow-md ring-2 ring-slate-400 ${base}`}
      >
        <IconStar className="w-4 h-4" />
        Silver
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-slate-200 font-semibold uppercase text-slate-700 ring-2 ring-slate-300 ${base}`}
    >
      <IconCheck className="w-3 h-3" />
      Basic
    </span>
  )
}

export function StarRating({ value, count, compact = false }: { value: number; count?: number; compact?: boolean }) {
  if (!count) return <span className="text-xs text-slate-400">Pas encore d'avis</span>
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        <IconStar filled className="w-4 h-4 text-amber-500" />
        <span className="font-semibold text-slate-800">{value.toFixed(1)}</span>
      </div>
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
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition transform hover:scale-105 ${
        liked
          ? 'bg-rose-100 text-rose-600 ring-2 ring-rose-300 shadow-md'
          : 'bg-white/90 text-slate-600 ring-1 ring-slate-200 hover:text-rose-500 hover:ring-rose-200'
      } ${className}`}
    >
      <IconHeart filled={liked} className={`inline-block w-4 h-4 ${pop ? 'animate-heart-pop' : ''}`} />
      <span className="font-bold">{likes}</span>
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
  const [isHovered, setIsHovered] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const supplier = users.find((u) => u.id === e.supplierId)
  const cat = categories.find((c) => c.id === e.categoryId)
  const rating = getRating(e.id)
  const gold = e.tier === 'GOLD'

  const handlePhotoChange = (index: number) => {
    setCurrentPhotoIndex(index)
  }

  const handleQuoteClick = (evt: React.MouseEvent) => {
    evt.preventDefault()
    evt.stopPropagation()
    if (onQuote) {
      onQuote(e.id)
    } else {
      navigate(`/equipment/${e.id}`)
    }
  }

  return (
    <>
      <div
        className={`product-card group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
          isHovered ? '-translate-y-2 shadow-2xl' : 'shadow-md hover:shadow-lg'
        } cursor-pointer ${
          gold
            ? 'border-amber-200 ring-1 ring-amber-100 hover:shadow-amber-200/60'
            : e.tier === 'SILVER'
              ? 'border-slate-200'
              : 'border-slate-100'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section with Multiple Photos */}
        <Link to={`/equipment/${e.id}`} className="relative block h-44 overflow-hidden bg-slate-100 group">
          <img
            src={e.photos[currentPhotoIndex]}
            alt={e.name}
            onError={onImgError}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-125' : 'scale-100'
            }`}
            loading="lazy"
          />

          {/* Photo Gallery Indicators */}
          {e.photos.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 px-2">
              {e.photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(evt) => {
                    evt.preventDefault()
                    evt.stopPropagation()
                    handlePhotoChange(idx)
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentPhotoIndex
                      ? 'w-6 bg-white'
                      : 'w-1.5 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <TierBadge tier={e.tier} />
          <LikeButton equipmentId={e.id} likes={e.likes} />
        </div>
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-xs font-semibold text-white transition-transform duration-300 group-hover:translate-y-0">
          Voir le matériel →
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/equipment/${e.id}`} className="font-bold text-lg text-slate-900 transition hover:text-brand-600">
          {e.name}
        </Link>
        <p className="mt-1 text-sm text-slate-600">
          {cat?.name} • {e.brand} {e.model}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <StarRating value={rating.average} count={rating.count} />
        </div>

        {gold && (
          <div className="mt-3 space-y-1.5 text-sm text-slate-600 bg-amber-50 rounded p-3 border border-amber-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 text-amber-600 flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              {e.hours.toLocaleString('fr-FR')} heures
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 text-blue-600 flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              {e.year}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 text-green-600 flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12z"></path><path d="M9 9h.01"></path><path d="M15 9h.01"></path><path d="M9 15a3 3 0 0 0 6 0"></path></svg>
              </div>
              {e.declaredCondition}
            </div>
            {e.category && <div className="flex items-center gap-2">
              <div className="w-4 h-4 text-purple-600 flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 10.26 24 10.27 17.55 16.73 19.64 25 12 19.54 4.36 25 6.45 16.73 0 10.27 8.91 10.26 12 2"></polygon></svg>
              </div>
              Catégorie: {e.category}
            </div>}
          </div>
        )}

        <div className="mt-3 flex flex-1 flex-col justify-end gap-2 text-sm text-slate-600">
          <span className="flex items-center gap-2"><IconBuilding className="w-4 h-4 text-slate-500 flex-shrink-0" /> <span className="font-medium">{supplier?.company}</span></span>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <IconMapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="font-medium">{e.location.split(',')[0]}</span>
            </span>
            {e.status === 'DISPONIBLE' || e.status === 'CATEGORISE' ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Disponible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-amber-600 text-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> En inspection
              </span>
            )}
          </div>
          {e.category && (
            <span className="mt-1">
              <CategoryBadge category={e.category} />
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to={`/equipment/${e.id}`}
            className="rounded-lg border-2 border-brand-200 py-2.5 text-center text-sm font-bold text-brand-700 transition transform hover:bg-brand-50 hover:scale-105 active:scale-95"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Voir
          </Link>
          <button
            onClick={handleQuoteClick}
            className="rounded-lg bg-accent-500 py-2.5 text-sm font-bold text-white transition transform hover:bg-accent-600 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Devis
          </button>
        </div>
      </div>
      </div>

      {/* Full Screen Image Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-900/80 p-2 text-white hover:bg-slate-900 transition"
            >
              <IconClose className="w-6 h-6" />
            </button>

            <div className="p-6">
              <img
                src={e.photos[currentPhotoIndex]}
                alt={e.name}
                className="w-full rounded-lg"
                onError={onImgError}
              />

              {e.photos.length > 1 && (
                <div className="mt-6 flex justify-center gap-3">
                  {e.photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePhotoChange(idx)}
                      className={`transition transform ${
                        idx === currentPhotoIndex ? 'scale-110 ring-2 ring-brand-600' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={e.photos[idx]}
                        alt={`Photo ${idx + 1}`}
                        className="h-16 w-20 rounded object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 space-y-4 border-t pt-6">
                <h2 className="text-2xl font-bold text-slate-900">{e.name}</h2>
                <p className="text-sm text-slate-600">{e.brand} {e.model} • {e.year}</p>
                <p className="text-slate-700">{e.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
    )
  }
