import { BookOpen, Newspaper, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero, FadeIn, CtaBanner } from '../../components/marketing/Shared'

const resources = [
  {
    icon: BookOpen,
    title: 'Documentation',
    description: "Guides d'utilisation de la plateforme, des espaces Auditeur/Admin/RSSI et du wizard de mission.",
  },
  {
    icon: Newspaper,
    title: 'Blog',
    description: 'Analyses de menaces, retours de terrain et actualités de la cybersécurité en Afrique.',
  },
  {
    icon: FileText,
    title: 'Guides & livres blancs',
    description: 'Méthodologie MEHARI, préparation ISO 27001, conformité RGPD, NIS2, DORA et ANSSI.',
  },
]

export function RessourcesPage() {
  return (
    <>
      <PageHero
        label="Ressources"
        title={
          <>
            Tout pour maîtriser votre <span className="text-brand">posture de sécurité</span>
          </>
        }
        subtitle="Documentation, articles et guides pratiques rédigés par nos experts en audit et conformité."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {resources.map((r, i) => (
            <FadeIn key={r.title} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                  <r.icon size={22} className="text-brand" />
                </span>
                <h2 className="mt-4 text-lg font-bold text-text-on-light">{r.title}</h2>
                <p className="mt-2 flex-1 text-sm text-text-on-light-muted">{r.description}</p>
                <Link to="/contact" className="mt-5 text-sm font-semibold text-brand hover:underline">
                  Bientôt disponible — être notifié →
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  )
}
