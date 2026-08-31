import { FileText, Search, CheckCircle, Users } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    Icon: FileText,
    title: 'Référencer',
    description: 'Le fournisseur déclare son engin avec documents, photos et tarifs.',
  },
  {
    number: '02',
    Icon: Search,
    title: 'Vérifier',
    description: "Notre équipe technique inspecte l'engin et vérifie les informations.",
  },
  {
    number: '03',
    Icon: CheckCircle,
    title: 'Décider & publier',
    description: "L'administration valide l'engin et lui attribue son niveau de certification.",
  },
  {
    number: '04',
    Icon: Users,
    title: 'Mettre en relation',
    description: 'Le client compare les équipements et envoie une demande au fournisseur.',
  },
]

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Comment ça fonctionne ?</h2>
        <p className="mt-4 text-lg text-slate-600">Un processus simple et transparent pour référencer, vérifier et mettre en relation.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-4">
        {STEPS.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="text-5xl font-black text-yellow-100">{step.number}</div>
              <div className="mt-4 rounded-xl bg-slate-50 p-6">
                <div className="inline-flex items-center justify-center rounded-lg bg-yellow-100 p-3">
                  <step.Icon className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              </div>
            </div>
        ))}
      </div>
    </section>
  )
}
