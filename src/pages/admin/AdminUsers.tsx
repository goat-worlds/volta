import { useState } from 'react'
import { Pencil, UserPlus } from 'lucide-react'
import { useStore, type UserInput } from '../../store/StoreContext'
import { Card, Modal, PageTitle, Toast } from '../../components/ui'
import type { Role, User } from '../../store/types'

/**
 * Comptes de la plateforme.
 *
 * La page ne faisait que lister : créer un fournisseur ou corriger un rôle
 * imposait de passer par la base. L'administration dispose maintenant des deux
 * opérations, contre les mêmes endpoints que le reste de l'application.
 */

const ROLE_STYLE: Record<Role, string> = {
  ADMIN: 'bg-slate-900 text-white',
  SUPPLIER: 'bg-amber-100 text-amber-800',
  TECHNICAL: 'bg-sky-100 text-sky-800',
  CLIENT: 'bg-slate-100 text-slate-700',
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administration',
  SUPPLIER: 'Fournisseur',
  TECHNICAL: 'Équipe technique',
  CLIENT: 'Client',
}

const EMPTY: UserInput = { name: '', email: '', phone: '', role: 'CLIENT', company: '', city: '', password: '' }

export default function AdminUsers() {
  const { users, createUser, updateUser } = useStore()

  // `null` ferme la fenêtre ; un objet sans id est une création.
  const [editing, setEditing] = useState<{ id?: string; form: UserInput } | null>(null)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 4000)
  }

  const openCreate = () => {
    setEditing({ form: { ...EMPTY } })
    setFormError(null)
  }

  const openEdit = (u: User) => {
    // Le mot de passe reste vide en modification : on ne le relit jamais, et un
    // champ prérempli laisserait croire qu'on peut le consulter.
    setEditing({
      id: u.id,
      form: { name: u.name, email: u.email, phone: u.phone, role: u.role, company: u.company, city: u.city },
    })
    setFormError(null)
  }

  const save = async () => {
    if (!editing) return
    setBusy(true)
    setFormError(null)
    try {
      if (editing.id) {
        await updateUser(editing.id, editing.form)
        showToast('Compte mis à jour.')
      } else {
        await createUser(editing.form)
        showToast('Compte créé.')
      }
      setEditing(null)
    } catch {
      setFormError(
        editing.id
          ? "La modification a échoué. L'email est peut-être déjà pris."
          : "La création a échoué. Vérifiez l'email et le mot de passe (6 caractères minimum).",
      )
    } finally {
      setBusy(false)
    }
  }

  const set = (patch: Partial<UserInput>) =>
    setEditing((e) => (e ? { ...e, form: { ...e.form, ...patch } } : e))

  const field = 'w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-amber-500 focus:outline-none'
  const label = 'mb-1 block text-xs font-medium text-slate-500'

  const counts = (['SUPPLIER', 'TECHNICAL', 'CLIENT', 'ADMIN'] as Role[])
    .map((r) => ({ role: r, n: users.filter((u) => u.role === r).length }))
    .filter((c) => c.n > 0)

  return (
    <div>
      <PageTitle
        title="Utilisateurs"
        subtitle={
          counts.length
            ? counts.map((c) => `${c.n} ${ROLE_LABEL[c.role].toLowerCase()}`).join(' · ')
            : 'Comptes de la plateforme VOLTA.'
        }
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-500"
          >
            <UserPlus size={15} />
            Nouveau compte
          </button>
        }
      />

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Société</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.company || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLE[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{u.email || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{u.phone || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{u.city || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(u)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50"
                  >
                    <Pencil size={13} />
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Modifier le compte' : 'Nouveau compte'}
      >
        {editing && (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Nom complet</label>
                <input className={field} value={editing.form.name ?? ''} onChange={(e) => set({ name: e.target.value })} />
              </div>
              <div>
                <label className={label}>Rôle</label>
                <select
                  className={field}
                  value={editing.form.role ?? 'CLIENT'}
                  onChange={(e) => set({ role: e.target.value as Role })}
                >
                  {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={label}>Société / structure</label>
              <input className={field} value={editing.form.company ?? ''} onChange={(e) => set({ company: e.target.value })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Email</label>
                <input type="email" className={field} value={editing.form.email ?? ''} onChange={(e) => set({ email: e.target.value })} />
              </div>
              <div>
                <label className={label}>Téléphone</label>
                <input className={field} value={editing.form.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Ville</label>
                <input className={field} value={editing.form.city ?? ''} onChange={(e) => set({ city: e.target.value })} />
              </div>
              {!editing.id && (
                <div>
                  <label className={label}>Mot de passe initial</label>
                  <input
                    type="password"
                    minLength={6}
                    className={field}
                    placeholder="6 caractères minimum"
                    value={editing.form.password ?? ''}
                    onChange={(e) => set({ password: e.target.value })}
                  />
                </div>
              )}
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                disabled={busy}
                onClick={() => void save()}
                className="rounded-lg bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-500 disabled:opacity-60"
              >
                {busy ? 'Enregistrement…' : editing.id ? 'Enregistrer' : 'Créer le compte'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Toast message={toast} />
    </div>
  )
}
