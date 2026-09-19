import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Loader2, Upload, X } from 'lucide-react'
import { photosForCategory } from '../../lib/enginPhotos'
import { useStore } from '../../store/StoreContext'
import { Card, PageTitle, ProgressBar } from '../../components/ui'
import { errorMessage } from '../../store/api'
import { uploadEquipmentPhoto } from '../../services/uploads'


export default function SupplierEquipmentNew() {
  const { categories, addEquipment, submitEquipment, currentUser } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    categoryId: categories[0]?.id ?? '',
    brand: '',
    model: '',
    year: 2020,
    hours: 0,
    location: "Abidjan, Côte d'Ivoire",
    pricePerDay: 100000,
    available: true,
    withOperator: false,
    description: '',
    declaredCondition: 'Bon état',
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<{ name: string; type: string }[]>([])

  const input = 'w-full rounded-lg border border-slate-300 p-2 text-sm'
  const label = 'mb-1 block text-xs font-medium text-slate-500'

  // La photothèque suit la catégorie choisie à l'étape 1 : un loueur de pelles
  // voit ses pelles en premier.
  const gallery = photosForCategory(form.categoryId)
  const togglePhoto = (src: string) =>
    setPhotos((p) => (p.includes(src) ? p.filter((x) => x !== src) : [...p, src]))
  const addDocument = (name: string) => setDocuments((d) => [...d, { name, type: 'PDF' }])

  /**
   * Import de photos réelles de l'engin, en plus de la photothèque de
   * démonstration ci-dessous. Chaque fichier part vers
   * EquipmentPhotoController, qui le stocke sous un nom UUID et renvoie son
   * URL publique ; c'est cette URL qui rejoint `photos`, la même liste que
   * les visuels piochés dans la photothèque.
   */
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadError(null)
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const { url } = await uploadEquipmentPhoto(file)
        setUploadedPhotos((p) => [...p, url])
        setPhotos((p) => [...p, url])
      }
    } catch (err) {
      setUploadError(errorMessage(err, "L'envoi de la photo a échoué."))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeUploadedPhoto = (url: string) => {
    setUploadedPhotos((p) => p.filter((x) => x !== url))
    setPhotos((p) => p.filter((x) => x !== url))
  }

  const finish = async (submit: boolean) => {
    setSaving(true)
    try {
      const eq = await addEquipment({
        ...form,
        photos: photos.length ? photos : [gallery[0].src],
        documents,
        // Le serveur ignore ce champ et retient l'utilisateur authentifié ;
        // il reste envoyé pour que le contrat de l'API soit complet.
        supplierId: currentUser?.id ?? '',
      })
      if (submit) await submitEquipment(eq.id)
      navigate('/supplier/equipment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <PageTitle title="Ajouter un engin" subtitle={`Étape ${step} sur 4`} />
      <div className="mb-6">
        <ProgressBar value={step * 25} />
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span className={step >= 1 ? 'font-semibold text-blue-600' : ''}>1. Identification</span>
          <span className={step >= 2 ? 'font-semibold text-blue-600' : ''}>2. Spécifications</span>
          <span className={step >= 3 ? 'font-semibold text-blue-600' : ''}>3. Photos & documents</span>
          <span className={step >= 4 ? 'font-semibold text-blue-600' : ''}>4. Revue & soumission</span>
        </div>
      </div>

      <Card className="p-6">
        {step === 1 && (
          <div className="grid gap-4">
            <div>
              <label className={label}>Nom de l'engin *</label>
              <input className={input} placeholder="ex : Caterpillar 320" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Catégorie *</label>
                <select className={input} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Marque *</label>
                <input className={input} placeholder="ex : Caterpillar" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div>
                <label className={label}>Modèle *</label>
                <input className={input} placeholder="ex : 320" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
              <div>
                <label className={label}>Année</label>
                <input type="number" className={input} value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
              </div>
            </div>
            <button
              disabled={!form.name || !form.brand || !form.model}
              onClick={() => setStep(2)}
              className="justify-self-end rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Heures compteur</label>
                <input type="number" className={input} value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} />
              </div>
              <div>
                <label className={label}>Prix indicatif / jour (FCFA)</label>
                <input type="number" className={input} value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: Number(e.target.value) })} />
              </div>
              <div>
                <label className={label}>Localisation</label>
                <input className={input} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <label className={label}>État déclaré</label>
                <select className={input} value={form.declaredCondition} onChange={(e) => setForm({ ...form, declaredCondition: e.target.value })}>
                  <option>Très bon état</option>
                  <option>Bon état</option>
                  <option>État moyen</option>
                </select>
              </div>
            </div>
            <div>
              <label className={label}>Description</label>
              <textarea className={input} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
                Disponible
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.withOperator} onChange={(e) => setForm({ ...form, withOperator: e.target.checked })} />
                Avec opérateur
              </label>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold hover:bg-slate-50">Retour</button>
              <button onClick={() => setStep(3)} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Suivant</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">Photos ({photos.length})</span>
                {photos.length > 0 && (
                  <button
                    onClick={() => setPhotos([])}
                    className="text-xs font-medium text-slate-500 hover:text-red-600"
                  >
                    Tout désélectionner
                  </button>
                )}
              </div>
              <p className="mb-3 text-xs text-slate-500">
                Sélectionnez les visuels qui correspondent à votre engin. La première photo
                retenue illustrera la fiche au catalogue.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((photo) => {
                  const index = photos.indexOf(photo.src)
                  const chosen = index !== -1
                  return (
                    <button
                      key={photo.src}
                      type="button"
                      onClick={() => togglePhoto(photo.src)}
                      aria-pressed={chosen}
                      className={`group relative overflow-hidden rounded-lg border-2 text-left transition ${
                        chosen ? 'border-btp-500 ring-2 ring-btp-200' : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <img loading="lazy" src={photo.src} alt={photo.label} className="h-24 w-full object-cover" />
                      {chosen && (
                        <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-btp-500 text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      )}
                      <span className="block truncate bg-white px-2 py-1.5 text-[11px] font-medium text-slate-600">
                        {photo.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">Vos propres photos ({uploadedPhotos.length})</span>
              </div>
              <p className="mb-3 text-xs text-slate-500">
                Préférez vos propres photos à la photothèque : elles montrent l'engin réel, pas un modèle
                similaire.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {uploadedPhotos.map((url) => (
                  <div key={url} className="group relative overflow-hidden rounded-lg border-2 border-transparent">
                    <img loading="lazy" src={url} alt="" className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeUploadedPhoto(url)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-red-600"
                      aria-label="Retirer cette photo"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-btp-500 hover:text-btp-600 disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  <span className="text-xs font-medium">{uploading ? 'Envoi…' : 'Importer'}</span>
                </button>
              </div>
              {uploadError && <p className="mt-2 text-xs font-medium text-red-600">{uploadError}</p>}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Documents ({documents.length})</span>
                <div className="flex gap-2">
                  <button onClick={() => addDocument('Certificat CE')} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium hover:bg-slate-200">+ Certificat CE</button>
                  <button onClick={() => addDocument("Facture d'achat")} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium hover:bg-slate-200">+ Facture</button>
                </div>
              </div>
              {documents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">Aucun document ajouté</div>
              ) : (
                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {documents.map((d, i) => (
                    <li key={i} className="flex items-center gap-2 px-3 py-2 text-sm">
                      <FileText size={15} className="shrink-0 text-slate-400" />
                      {d.name} <span className="text-xs text-slate-400">({d.type})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold hover:bg-slate-50">Retour</button>
              <button onClick={() => setStep(4)} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Suivant</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4">
            <h3 className="font-semibold">Revue du dossier</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><span className="text-slate-500">Nom :</span> {form.name}</div>
              <div><span className="text-slate-500">Catégorie :</span> {categories.find((c) => c.id === form.categoryId)?.name}</div>
              <div><span className="text-slate-500">Marque / modèle :</span> {form.brand} {form.model}</div>
              <div><span className="text-slate-500">Année :</span> {form.year}</div>
              <div><span className="text-slate-500">Heures :</span> {form.hours}</div>
              <div><span className="text-slate-500">Prix / jour :</span> {form.pricePerDay.toLocaleString('fr-FR')} FCFA</div>
              <div><span className="text-slate-500">Photos :</span> {photos.length}</div>
              <div><span className="text-slate-500">Documents :</span> {documents.length}</div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(3)} className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold hover:bg-slate-50">Retour</button>
              <div className="flex gap-2">
                <button
                  disabled={saving}
                  onClick={() => finish(false)}
                  className="rounded-lg border border-blue-600 px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement…' : 'Enregistrer en brouillon'}
                </button>
                <button
                  disabled={saving}
                  onClick={() => finish(true)}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? 'Soumission…' : 'Soumettre à VOLTA'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
