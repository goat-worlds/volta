import { Construction } from 'lucide-react'

export function PlaceholderPage({ title, dark }: { title: string; dark?: boolean }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center justify-center py-24 text-center">
      <Construction size={36} className="text-brand" />
      <h1 className="mt-4 text-2xl font-extrabold">{title}</h1>
      <p className={`mt-2 text-sm ${dark ? 'text-text-on-dark-muted' : 'text-slate-500'}`}>
        Cet écran arrive dans une prochaine itération.
      </p>
    </div>
  )
}
