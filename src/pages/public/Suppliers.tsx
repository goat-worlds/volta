import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, PageTitle } from '../../components/ui'

export default function Suppliers() {
  const { users, equipment } = useStore()
  const suppliers = users.filter((u) => u.role === 'SUPPLIER')

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8">
      <PageTitle title="Nos fournisseurs" subtitle="Des fournisseurs vérifiés par VOLTA pour vous garantir qualité et fiabilité." />
      <div className="grid gap-4">
        {suppliers.map((s) => {
          const count = equipment.filter((e) => e.supplierId === s.id && e.status === 'PUBLISHED').length
          return (
            <Card key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-700">
                  {s.company.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{s.company}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">✔ Fournisseur vérifié</span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    📍 {s.city} · {count} engin(s) publié(s) · 📞 {s.phone}
                  </div>
                </div>
              </div>
              <Link to="/catalogue" className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                Voir les équipements
              </Link>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
