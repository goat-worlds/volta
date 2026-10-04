import { useEffect, useRef, useState } from 'react'
import type { ComponentType, ReactNode, Ref } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Search, Send } from 'lucide-react'
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
  ref,
  padding = 'default',
  children,
}: {
  id?: string
  tone?: Tone
  className?: string
  /**
   * La couverture d'accueil a besoin de mesurer sa propre hauteur pour amener
   * le visiteur à la section suivante au clic sur « Découvrir ». React 19 passe
   * `ref` comme une prop ordinaire : pas de `forwardRef` à introduire.
   */
  ref?: Ref<HTMLElement>
  /**
   * Rythme vertical. « none » le rend à l'appelant.
   *
   * Une classe passée par `className` ne peut pas l'emporter sur `py-20` : à
   * spécificité égale, c'est l'ordre dans la feuille générée qui tranche, pas
   * l'ordre dans l'attribut. Il faudrait un `!important` — dont la syntaxe a
   * changé entre Tailwind 3 et 4, et qui ferait dépendre la hauteur d'une
   * couverture d'un détail de version. Une porte explicite coûte moins cher.
   */
  padding?: 'default' | 'none'
  children: ReactNode
}) {
  return (
    <section
      id={id}
      ref={ref}
      className={`${SURFACE[tone]} scroll-mt-16 px-4 sm:px-6 ${
        padding === 'none' ? '' : 'py-20'
      } ${className}`}
    >
      {/* `w-full` est sans effet dans le flux normal, où ce bloc occupe déjà
          toute la largeur. Il compte quand la section devient un conteneur
          flex — ce que fait la couverture pour centrer son contenu. */}
      <div className="mx-auto w-full max-w-7xl">{children}</div>
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

/**
 * Couverture de section : le propos à gauche, une photo à droite.
 *
 * Les sections s'ouvraient toutes sur un chapeau centré. Sur une page qui en
 * enchaîne huit, rien ne distinguait plus l'une de l'autre, et un site de
 * matériel de chantier ne montrait aucun matériel avant la grille des
 * vignettes. La photo situe la section avant qu'on l'ait lue.
 *
 * Réservée aux sections qui ouvrent un sujet. L'appliquer partout la
 * banaliserait, et le chapeau centré retrouverait le même défaut.
 *
 * `reverse` renvoie la photo à gauche : sur deux sections voisines, le même
 * côté deux fois de suite donne un escalier.
 */
export function SectionCover({
  label,
  title,
  text,
  image,
  imageAlt,
  tone = "light",
  reverse = false,
  reperes,
  children,
}: {
  label: ReactNode
  title: ReactNode
  text?: ReactNode
  image: string
  /** Décrit la photo pour qui ne la voit pas. Jamais vide : elle porte du sens. */
  imageAlt: string
  tone?: Tone
  reverse?: boolean
  /** Trois repères au plus. Au-delà, ils cessent d’être des repères. */
  reperes?: readonly string[]
  /** Les actions, sous le texte. */
  children?: ReactNode
}) {
  const t = TEXT[tone]
  return (
    <div className={`grid items-center gap-10 lg:gap-14 ${reverse ? "lg:grid-cols-[1.05fr_1fr]" : "lg:grid-cols-[1fr_1.05fr]"}`}>
      <Reveal className={reverse ? "lg:order-2" : undefined}>
        <Eyebrow tone={tone}>{label}</Eyebrow>
        <h2 className={`volta-display mt-4 text-4xl sm:text-5xl ${t.title}`}>{title}</h2>
        {text && <p className={`mt-4 text-lg leading-relaxed ${t.body}`}>{text}</p>}
        {reperes && (
          <ul className={`mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm ${t.body}`}>
            {reperes.map((r) => (
              <li key={r} className="flex items-center gap-2">
                <Check size={15} className="shrink-0 text-btp-500" aria-hidden />
                {r}
              </li>
            ))}
          </ul>
        )}
        {children}
      </Reveal>

      <Reveal delay={0.08} className={reverse ? "lg:order-1" : undefined}>
        {/* Proportion fixe : la hauteur ne depend pas du fichier, et la
            section ne sursaute pas quand la photo arrive. */}
        <div className="aspect-[4/3] overflow-hidden rounded-xl border border-papier-200 bg-papier-100 shadow-sm sm:aspect-[16/10]">
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </Reveal>
    </div>
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
      className={`group/card flex h-full scroll-mt-24 flex-col rounded-lg border ${t.border} ${t.card} p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_1px_rgba(15,23,42,0.03)] transition-[border-color,box-shadow,transform] duration-200 hover:border-btp-400/60 hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.14),0_2px_6px_rgba(15,23,42,0.05)] motion-safe:hover:-translate-y-[3px] ${className}`}
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
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-btp-400 via-btp-500 to-btp-600 shadow-[0_8px_24px_-8px_rgba(249,138,7,0.55)] transition-transform duration-200 motion-safe:group-hover/card:scale-105">
      <Icon size={20} className="text-white" />
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
  compact = false,
}: {
  label: ReactNode
  title: ReactNode
  subtitle?: string
  children?: ReactNode
  /**
   * Version basse, pour les pages de catalogue.
   *
   * En pleine hauteur, ce bandeau occupe tout le premier écran d'un téléphone :
   * on arrive sur une page de matériel et l'on ne voit aucun matériel. Le
   * visiteur d'un catalogue vient voir des engins — le titre doit tenir en haut
   * sans repousser la grille sous la ligne de flottaison.
   */
  compact?: boolean
}) {
  if (compact) {
    return (
      <section className="bg-papier-50 px-4 pb-8 pt-10 sm:px-6">
        <Reveal className="mx-auto max-w-7xl">
          <Eyebrow>{label}</Eyebrow>
          <h1 className="volta-display mt-2 text-3xl text-acier-900 sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-base text-papier-700">{subtitle}</p>}
          {children}
        </Reveal>
      </section>
    )
  }

  return (
    <section className="bg-papier-50 px-4 pb-16 pt-20 text-center sm:px-6">
      <Reveal className="mx-auto max-w-3xl">
        <Eyebrow>{label}</Eyebrow>
        <h1 className="volta-display mt-4 text-5xl text-acier-900 sm:text-6xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-papier-700">{subtitle}</p>
        )}
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
