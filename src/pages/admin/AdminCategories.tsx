import { useState } from 'react'
import { ImageIcon, Trash2, Upload } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { apiPost } from '../../store/api'
import { uploadEquipmentPhoto } from '../../services/uploads'
import { Card, PageTitle } from '../../components/ui'
import { useToast } from '../../components/feedback/Toaster'
import type { Category } from '../../store/types'

/**
 * Les photos des catégories du catalogue.
 *
 * <h2>Pourquoi une photo</h2>
 *
 * Les catégories ne portaient qu'un pictogramme. Cela suffit dans une liste
 * déroulante de filtre, où l'on cherche un mot qu'on connaît déjà. Cela ne
 * suffit pas sur une carte : « Niveleuse », « Compacteur » et « Foreuse » sont
 * trois mots que la moitié des visiteurs ne distingue pas, et trois machines
 * que tout le monde reconnaît en photo. Un chef de chantier trouve la sienne
 * avant de l'avoir lue.
 *
 * <h2>Pourquoi l'administration seule</h2>
 *
 * Une catégorie est une rubrique du catalogue, pas le bien d'un fournisseur :
 * celui qui la changerait changerait la vitrine de tous les autres.
 *
 * <h2>Le fichier</h2>
 *
 * La photo passe par le même téléversement que celles des engins — elle est
 * donc filigranée comme elles, ce qui est le but : une image du site qu'on
 * retrouve ailleurs doit dire d'où elle vient. La catégorie n'en garde que
 * l'adresse.
 */
export default function AdminCategories() {
  const { categories, reload } = useStore()
  const [busy, setBusy] = useState<string | null>(null)
  const toast = useToast()

  const poser = async (c: Category, fichier: File | null) => {
    if (!fichier) return
    setBusy(c.id)
    try {
      const { url } = await uploadEquipmentPhoto(fichier)
      await apiPost(`/admin/categories/${c.id}/image`, { image: url })
      await reload()
      toast.success('Photo posée', c.name)
    } catch (e) {
      toast.fromError(e)
    } finally {
      setBusy(null)
    }
  }

  const retirer = async (c: Category) => {
    setBusy(c.id)
    try {
      await apiPost(`/admin/categories/${c.id}/image`, { image: '' })
      await reload()
      toast.info('Photo retirée', `${c.name} retombe sur son pictogramme.`)
    } catch (e) {
      toast.fromError(e)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Catégories du catalogue"
        subtitle="Une photo par catégorie : on reconnaît une machine avant de lire son nom."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <div className="relative h-32 bg-papier-100">
              {c.image ? (
                <img src={c.image} alt="" className="h-full w-full object-cover" />
              ) : (
                /* Sans photo, on montre le vide plutôt qu'une image d'emprunt :
                   une catégorie illustrée par la machine d'une autre tromperait
                   plus sûrement qu'un cadre gris. */
                <span className="flex h-full items-center justify-center text-papier-400">
                  <ImageIcon size={28} aria-hidden />
                </span>
              )}
            </div>

            <div className="p-4">
              <div className="font-semibold text-acier-900">{c.name}</div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-papier-200 px-3 py-2 text-sm font-semibold text-acier-900 transition hover:border-btp-400 ${
                    busy === c.id ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <Upload size={14} aria-hidden />
                  {c.image ? 'Remplacer' : 'Ajouter une photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="sr-only"
                    onChange={(e) => void poser(c, e.target.files?.[0] ?? null)}
                  />
                </label>
                {c.image && (
                  <button
                    type="button"
                    disabled={busy === c.id}
                    onClick={() => void retirer(c)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-papier-200 px-3 py-2 text-sm font-semibold text-acier-900 transition hover:border-red-300 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={14} aria-hidden />
                    Retirer
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
