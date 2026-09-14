import { useEffect, useRef, useState } from 'react'
import { ClipboardList, FileSearch, HeartHandshake, PackageCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Comment ça fonctionne — quatre temps, du besoin à la remise.
 *
 * La section décrivait le circuit interne d'un engin (référencer, inspecter,
 * publier) : exact, mais c'est le point de vue du fournisseur. Le visiteur
 * veut savoir ce qui lui arrive, à lui, après avoir dit son besoin. Les quatre
 * étapes sont les siennes et valent pour la location, l'achat et la recherche
 * de technicien.
 *
 * Le trait qui relie les jalons se remplit au défilement : il dit que les
 * étapes s'enchaînent, et donne à lire une progression plutôt qu'une liste.
 * Horizontal à partir de lg, vertical en dessous.
 */

interface Step {
  icon: LucideIcon
  title: string
  duration: string
  text: string
  outputs: string[]
}

const STEPS: Step[] = [
  {
    icon: ClipboardList,
    title: 'Vous décrivez',
    duration: '3 min',
    text: 'Un formulaire court, sans compte : ce qu’il vous faut, où, quand. Vous recevez une référence.',
    outputs: ['Aucune inscription', 'Référence de suivi', 'Reprise possible'],
  },
  {
    icon: FileSearch,
    title: 'Génie Sélect qualifie',
    duration: '24 à 48 h',
    text: 'L’équipe relit la demande, vérifie disponibilité, état et documents des solutions candidates.',
    outputs: ['Appel de qualification', 'Vérification sur pièces', 'Inspection si nécessaire'],
  },
  {
    icon: HeartHandshake,
    title: 'Vous recevez une proposition',
    duration: 'selon le besoin',
    text: 'Devis de location comparés, offre d’achat, profil de technicien : un interlocuteur, des conditions claires.',
    outputs: ['Prix et délai', 'Conditions écrites', 'Négociation possible'],
  },
  {
    icon: PackageCheck,
    title: 'Mission et suivi',
    duration: 'jusqu’au bout',
    text: 'Livraison, mise à disposition ou intervention, suivies sur votre référence jusqu’à la clôture.',
    outputs: ['Statut à chaque étape', 'Anomalies tracées', 'Clôture confirmée'],
  },
]

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1)
      return
    }
    let frame = 0
    let active = false
    const update = () => {
      const rect = el.getBoundingClientRect()
      const viewport = window.innerHeight
      const start = viewport * 0.85
      const end = viewport * 0.35
      setProgress(Math.max(0, Math.min(1, (start - rect.top) / (start - end))))
      frame = active ? requestAnimationFrame(update) : 0
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting
        if (active && !frame) frame = requestAnimationFrame(update)
        else if (!active && frame) {
          cancelAnimationFrame(frame)
          frame = 0
        }
      },
      { threshold: 0 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section id="comment" className="scroll-mt-16 mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-widest text-btp-600">Comment ça fonctionne</span>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-acier-900 md:text-4xl">
          Du besoin à la remise, en quatre temps.
        </h2>
        <p className="mt-3 text-lg text-slate-600">
          Le même circuit pour louer, acheter ou trouver un technicien. Vous ne traitez jamais à
          l’aveugle : chaque étape est visible sur votre référence.
        </p>
      </div>

      <div ref={ref} className="relative mt-14">
        <div aria-hidden className="absolute left-0 right-0 top-7 hidden lg:block">
          <div className="h-px w-full bg-slate-200" />
          <div
            className="absolute left-0 top-0 h-px bg-gradient-to-r from-btp-500 to-btp-300 transition-[width] duration-300 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div aria-hidden className="absolute bottom-0 left-7 top-0 w-px lg:hidden">
          <div className="h-full w-px bg-slate-200" />
          <div
            className="absolute left-0 top-0 w-px bg-gradient-to-b from-btp-500 to-btp-300 transition-[height] duration-300 ease-out"
            style={{ height: `${progress * 100}%` }}
          />
        </div>

        <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, i) => {
            const reached = progress >= (i + 0.5) / STEPS.length
            return (
              <li key={step.title} className="relative flex gap-5 lg:block">
                <div
                  className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors duration-500 ${
                    reached ? 'border-btp-500 text-btp-600' : 'border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="text-sm font-extrabold">0{i + 1}</span>
                  {reached && (
                    <span aria-hidden className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 18px -2px rgba(249,138,7,0.5)' }} />
                  )}
                </div>
                <div className="pb-2 lg:mt-6">
                  <div className="flex items-center gap-2">
                    <step.icon size={16} className={reached ? 'text-btp-600' : 'text-slate-400'} />
                    <h3 className="font-bold text-acier-900">{step.title}</h3>
                  </div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{step.duration}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {step.outputs.map((o) => (
                      <li key={o} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
