import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand">{children}</p>
  )
}

export function FadeIn({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function CtaBanner() {
  return (
    <section className="bg-bg-dark px-4 py-20 sm:px-6">
      <FadeIn>
        <div className="mx-auto max-w-5xl rounded-xl border border-border-dark bg-surface-dark px-6 py-14 text-center shadow-xl">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Prêt à transformer votre cybersécurité ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-on-dark-muted">
            Rejoignez les organisations qui font confiance à CYBERAS Intelligence pour protéger ce qui compte vraiment.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/demo"
              className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-dark"
            >
              Demander une démonstration →
            </Link>
            <Link
              to="/contact"
              className="rounded-md border border-border-dark px-6 py-3 text-sm font-semibold text-text-on-dark transition-colors hover:border-border-dark-hover hover:text-white"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}

export function PageHero({ label, title, subtitle }: { label: string; title: ReactNode; subtitle: string }) {
  return (
    <section className="bg-bg-dark px-4 pb-16 pt-20 text-center sm:px-6">
      <FadeIn>
        <SectionLabel>{label}</SectionLabel>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold text-white sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-text-on-dark-muted">{subtitle}</p>
      </FadeIn>
    </section>
  )
}
