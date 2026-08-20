import { Target, Users, Building2 } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner } from '../../components/marketing/Shared'

const blocks = [
  {
    icon: Target,
    title: 'Notre mission',
    description:
      "Rendre l'audit et la conformité cybersécurité accessibles, rapides et fiables pour les organisations africaines, grâce à l'intelligence artificielle.",
  },
  {
    icon: Users,
    title: "L'équipe",
    description:
      "Des auditeurs certifiés, des ingénieurs sécurité et des experts IA basés à Abidjan, engagés pour la souveraineté numérique du continent.",
  },
  {
    icon: Building2,
    title: 'Partenaires',
    description:
      "Nous collaborons avec les régulateurs, les intégrateurs et les acteurs majeurs du numérique en Côte d'Ivoire et dans la sous-région.",
  },
]

export function AProposPage() {
  return (
    <>
      <PageHero
        label="À propos"
        title={
          <>
            La cybersécurité intelligente, <span className="text-brand">made in Africa</span>
          </>
        }
        subtitle="CYBERAS Intelligence est née à Abidjan avec une conviction : les organisations africaines méritent des outils de cybersécurité de classe mondiale, hébergés sur le continent."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {blocks.map((b, i) => (
            <FadeIn key={b.title} delay={i * 0.08}>
              <div className="h-full rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                  <b.icon size={22} className="text-brand" />
                </span>
                <h2 className="mt-4 text-lg font-bold text-text-on-light">{b.title}</h2>
                <p className="mt-2 text-sm text-text-on-light-muted">{b.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  )
}
