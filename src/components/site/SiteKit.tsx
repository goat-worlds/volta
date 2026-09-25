import { useEffect, useRef, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, Send } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Le vocabulaire de mise en page des écrans publics.
 *
 * Chaque section de l'accueil avait sa propre grammaire : ici une grille de
 * cartes, là une liste de définitions, ailleurs une frise qui se remplit au
 * défilement, un bandeau à photo détourée, un grand chiffre en bordure. Pris
 * un par un, chacun se défendait ; mis bout à bout, la page changeait de
 * langue à chaque écran de défilement et se lisait comme une brochure
 * assemblée par morceaux.
 *
 * Toutes les sections passent désormais par les pièces d'ici : une surface
 * (`Section`), un chapeau centré (`SectionHeader`), une carte (`Card`), une
 * apparition (`Reveal`). Le rythme vertical, la largeur de lecture, la taille
 * des titres et l'écart entre les cartes sont tenus en un seul endroit : une
 * section nouvelle ressemble aux autres sans effort, et corriger le rythme se
 * fait ici plutôt qu'en huit fichiers.
 *
 * Les couleurs restent celles de VOLTA — ambre chantier, acier, papier : c'est
 * la disposition qui est mise au pas, pas l'identité.
 */

/** Les trois fonds admis, alternés d'une section à l'autre. */
export type Tone = 'light' | 'muted' | 'dark'

const SURFACE: Record<Tone, string> = {
  light: 'bg-white',
  muted: 'bg-papier-50',
  dark: 'bg-acier-900',
}

/**
 * Ce que chaque fond impose à ce qu'on pose dessus.
 *
 * Écrit une fois : les sections nommaient jusqu'ici leurs couleurs à la main,
 * et le même « texte secondaire » existait en trois nuances selon le fichier.
 */
export const TEXT: Record<
  Tone,
  {
    eyebrow: string
    title: string
    body: string
    muted: string
    border: string
    card: string
    chip: string
    rule: string
  }
> = {
  light: {
    eyebrow: 'text-btp-600',
    title: 'text-acier-900',
    body: 'text-papier-700',
    muted: 'text-papier-600',
    border: 'border-papier-200',
    card: 'bg-white shadow-xs',
    chip: 'border-papier-200 bg-papier-50 text-acier-900',
    rule: 'bg-papier-200',
  },
  muted: {
    eyebrow: 'text-btp-600',
    title: 'text-acier-900',
    body: 'text-papier-700',
    muted: 'text-papier-600',
    border: 'border-papier-200',
    card: 'bg-white shadow-xs',
    chip: 'border-papier-200 bg-white text-acier-900',
    rule: 'bg-papier-200',
  },
  dark: {
    eyebrow: 'text-btp-400',
    title: 'text-white',
    body: 'text-acier-200',
    muted: 'text-acier-300',
    border: 'border-white/10',
    card: 'bg-acier-800',
    chip: 'border-white/10 bg-white/5 text-acier-100',
    rule: 'bg-white/10',
  },
}

/**
 * Apparition au défilement.
 *
 * Une seule courbe et une seule durée pour tout le site : les entrées de la
 * couverture étaient jouées par des classes d'animation propres, les sections
 * n'en avaient aucune, et l'on passait d'un écran qui bouge à un écran figé.
 * Coupée net si l'utilisateur a demandé moins de mouvement — le contenu est
 * alors visible d'emblée, jamais masqué en attendant un observateur.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`site-reveal${shown ? ' is-shown' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}

/**
 * Surface de section.
 *
 * Même gouttière, même rythme vertical, même largeur de contenu partout : les
 * sections oscillaient entre `py-8` et `py-24`, et deux d'entre elles posaient
 * leur propre largeur maximale.
 */
export function Section({
  id,
  tone = 'light',
  className = '',
  children,
}: {
  id?: string
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={`${SURFACE[tone]} scroll-mt-16 px-4 py-20 sm:px-6 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  )
}

/** Surtitre gravé, dans la teinte que le fond autorise. */
export function Eyebrow({ tone = 'light', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`volta-eyebrow ${TEXT[tone].eyebrow}`}>{children}</span>
}

/**
 * Chapeau de section : surtitre, titre, une phrase.
 *
 * Centré et tenu à une largeur de lecture. Les chapeaux alignés à gauche sur
 * deux colonnes — avec un lien poussé dans l'angle opposé — faisaient croire
 * à chaque fois à une section venue d'une autre page.
 */
export function SectionHeader({
  label,
  title,
  text,
  tone = 'light',
  className = '',
}: {
  label: ReactNode
  title: ReactNode
  text?: ReactNode
  tone?: Tone
  className?: string
}) {
  const t = TEXT[tone]
  return (
    <Reveal className={`mx-auto max-w-2xl text-center ${className}`}>
      <Eyebrow tone={tone}>{label}</Eyebrow>
      <h2 className={`volta-display mt-4 text-4xl sm:text-5xl ${t.title}`}>{title}</h2>
      {text && <p className={`mt-4 text-lg leading-relaxed ${t.body}`}>{text}</p>}
    </Reveal>
  )
}

/** La carte : unique modèle de bloc sur les écrans publics. */
export function Card({
  id,
  tone = 'light',
  className = '',
  children,
}: {
  id?: string
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  const t = TEXT[tone]
  return (
    <article
      id={id}
      className={`flex h-full scroll-mt-24 flex-col rounded-lg border ${t.border} ${t.card} p-6 ${className}`}
    >
      {children}
    </article>
  )
}

/** Pastille d'icône : une seule taille, une seule teinte, partout. */
export function CardIcon({
  icon: Icon,
}: {
  icon: LucideIcon | ComponentType<{ size?: number; className?: string }>
}) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-btp-500/10">
      <Icon size={20} className="text-btp-500" />
    </span>
  )
}

/** Étiquettes de faits : ce que la carte garantit, en un mot chacune. */
export function Chips({ items, tone = 'light' }: { items: readonly string[]; tone?: Tone }) {
  const t = TEXT[tone]
  return (
    <ul className="mt-4 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${t.chip}`}>
          {item}
        </li>
      ))}
    </ul>
  )
}

/**
 * Grille de cartes : un seul écart, les mêmes points de rupture.
 *
 * Les sections employaient `gap-5`, `gap-6` et `gap-10` pour la même chose.
 */
export function CardGrid({ columns = 3, children }: { columns?: 2 | 3 | 4; children: ReactNode }) {
  const cols =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3'
  return <div className={`mt-12 grid gap-5 ${cols}`}>{children}</div>
}

/**
 * L'appel à l'action d'une section : un seul, sous la grille, jamais un par
 * carte. Les cartes portaient chacune son « Voir → », ce qui donnait douze
 * boutons à l'écran et aucune hiérarchie.
 */
export function SectionActions({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <Reveal className={`mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row ${className}`}>
      {children}
    </Reveal>
  )
}

/** Bouton plein — l'action principale. */
export function PrimaryLink({
  to,
  children,
  className = '',
}: {
  to: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-btp-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-btp-600 ${className}`}
    >
      {children}
    </Link>
  )
}

/** Bouton contour — l'action de second rang, dans la teinte du fond. */
export function SecondaryLink({
  to,
  tone = 'light',
  children,
  className = '',
}: {
  to: string
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  const skin =
    tone === 'dark'
      ? 'border-white/20 text-white hover:border-btp-400'
      : 'border-papier-300 text-acier-900 hover:border-btp-400'
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-bold transition ${skin} ${className}`}
    >
      {children}
    </Link>
  )
}

/** Lien « tout voir » d'une section qui ne montre qu'un extrait. */
export function MoreLink({
  to,
  children,
  tone = 'light',
}: {
  to: string
  children: ReactNode
  tone?: Tone
}) {
  return (
    <SecondaryLink to={to} tone={tone}>
      {children}
      <ArrowRight size={15} />
    </SecondaryLink>
  )
}

/**
 * Chapeau des pages intérieures : la couverture de l'accueil, en plus sobre.
 */
export function PageHero({
  label,
  title,
  subtitle,
  children,
}: {
  label: ReactNode
  title: ReactNode
  subtitle: string
  children?: ReactNode
}) {
  return (
    <section className="bg-papier-50 px-4 pb-16 pt-20 text-center sm:px-6">
      <Reveal className="mx-auto max-w-3xl">
        <Eyebrow>{label}</Eyebrow>
        <h1 className="volta-display mt-4 text-5xl text-acier-900 sm:text-6xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-papier-700">{subtitle}</p>
        {children}
      </Reveal>
    </section>
  )
}

/**
 * Appel final, commun aux écrans publics.
 *
 * Il remplace le bandeau d'accueil à deux colonnes et sa photo incrustée : la
 * dernière chose proposée au visiteur est celle pour laquelle il est venu —
 * dire son besoin. Le parcours propriétaire reste offert en second, pour qui
 * a du matériel.
 */
export function CtaBanner() {
  return (
    <Section tone="muted">
      <Reveal>
        <div className="mx-auto max-w-4xl rounded-xl border border-papier-200 bg-white px-6 py-14 text-center shadow-xs">
          <h2 className="volta-display text-4xl text-acier-900 sm:text-5xl">
            Dites-nous ce qu’il vous faut.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-papier-700">
            Un engin pour un chantier, un technicien pour une panne, une machine à acheter :
            décrivez votre besoin en quelques champs, sans créer de compte. VOLTA le confronte à
            son réseau d’engins vérifiés et revient vers vous avec une proposition.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <PrimaryLink to="/demande/location">
              <Send size={16} />
              Exprimer mon besoin
            </PrimaryLink>
            <SecondaryLink to="/catalogue">
              <Search size={16} />
              Parcourir le catalogue
            </SecondaryLink>
          </div>
          <p className="mt-6 text-sm text-papier-600">
            Vous avez du matériel ?{' '}
            <Link
              to="/proposer-un-engin"
              className="font-semibold text-btp-600 underline underline-offset-2 hover:text-btp-700"
            >
              Mettez votre engin en location
            </Link>
            . Déjà une référence ?{' '}
            <Link
              to="/suivi"
              className="font-semibold text-btp-600 underline underline-offset-2 hover:text-btp-700"
            >
              Suivez votre demande
            </Link>
            .
          </p>
        </div>
      </Reveal>
    </Section>
  )
}
