import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useExpenses } from '@/hooks/useExpenses'
import { useCategories } from '@/hooks/useCategories'
import { useAppStore } from '@/store/appStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, X, Search, Trash2, Edit2, Paperclip, ExternalLink, Image as ImageIcon, FileText } from 'lucide-react'
import { ModeToggle } from '@/components/shared/ModeToggle'
import type { Expense } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  value: z.coerce.number().positive('Valor deve ser positivo'),
  date: z.string().min(1, 'Data obrigatória'),
  category_id: z.string().optional().or(z.literal('')),
  description: z.string().optional(),
  observation: z.string().optional(),
})

type FormData = z.infer<typeof schema>

// Client-side canvas image compression
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        const MAX_WIDTH = 1024
        const MAX_HEIGHT = 1024

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Canvas to Blob failed'))
          }
        }, 'image/jpeg', 0.7) // 70% quality
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

export default function ExpensesPage() {
  const { user } = useAuth()
  const { mode, currentDate } = useAppStore()
  const location = useLocation()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Expense | null>(null)
  const [search, setSearch] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachTarget, setAttachTarget] = useState<string | null>(null)

  // Photo selected in the form modal
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const formFileInputRef = useRef<HTMLInputElement>(null)

  const { data: expenses = [], totalExpenses, createMutation, updateMutation, deleteMutation, uploadAttachment } = useExpenses({
    userId: user?.id || '', mode, year, month
  })
  const { data: categories = [] } = useCategories(user?.id, 'expense', mode)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  })

  const openForm = (item?: Expense) => {
    setSelectedPhoto(null)
    setPhotoPreview(null)
    if (item) {
      setEditItem(item)
      reset({ name: item.name, value: item.value, date: item.date, category_id: item.category_id || '', description: item.description || '', observation: item.observation || '' })
    } else {
      setEditItem(null)
      reset({ date: new Date().toISOString().split('T')[0] })
    }
    setShowForm(true)
  }

  useEffect(() => {
    if (location.state?.openForm) {
      openForm()
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const onSubmit = async (data: FormData) => {
    if (!user) return
    try {
      let expenseId = ''
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, ...data, mode })
        expenseId = editItem.id
        toast.success('Despesa atualizada!')
      } else {
        const created = await createMutation.mutateAsync({
          ...data, user_id: user.id, mode, company_id: null,
          category_id: data.category_id || null,
          description: data.description || null,
          observation: data.observation || null,
        })
        expenseId = created.id
        toast.success('Despesa adicionada!')
      }

      // If a photo/file was selected in the form, compress if image and upload it
      if (selectedPhoto && expenseId) {
        const isImage = selectedPhoto.type.startsWith('image/')
        toast.loading(isImage ? 'Processando e enviando foto da nota fiscal...' : 'Enviando documento PDF...')
        try {
          const fileToUpload = isImage ? await compressImage(selectedPhoto) : selectedPhoto
          await uploadAttachment(fileToUpload, expenseId, user.id)
          toast.dismiss()
          toast.success('Nota fiscal anexada!')
        } catch (err) {
          toast.dismiss()
          toast.error('Despesa salva, mas houve erro no envio da nota fiscal.')
        }
      }

      setShowForm(false)
      setSelectedPhoto(null)
      setPhotoPreview(null)
      reset()
    } catch {
      toast.error('Erro ao salvar despesa')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta despesa?')) return
    await deleteMutation.mutateAsync(id)
    toast.success('Despesa excluída')
  }

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !attachTarget || !user) return

    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'

    if (!isImage && !isPdf) {
      toast.error('Apenas fotos e PDFs são permitidos para a nota fiscal!')
      return
    }

    setUploadingId(attachTarget)
    try {
      let fileToUpload = file
      if (isImage) {
        toast.info('Comprimindo imagem...')
        fileToUpload = await compressImage(file)
      } else {
        toast.info('Enviando documento PDF...')
      }
      await uploadAttachment(fileToUpload, attachTarget, user.id)
      toast.success('Nota fiscal adicionada!')
    } catch {
      toast.error('Erro ao anexar arquivo')
    }
    setUploadingId(null)
    setAttachTarget(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFormPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'

    if (!isImage && !isPdf) {
      toast.error('Apenas fotos e PDFs são permitidos!')
      return
    }

    setSelectedPhoto(file)
    if (isImage) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPhotoPreview('pdf')
    }
  }

  const filtered = expenses.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.category as { name: string } | null)?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="py-lg space-y-lg">
      <ModeToggle />
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleAttachFile} accept="image/*,application/pdf" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-lg-mobile font-headline-lg text-on-surface">Despesas</h2>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Total: <span className="font-bold tnum text-error">{formatCurrency(totalExpenses)}</span>
          </p>
        </div>
        <button onClick={() => openForm()}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg text-label-md font-label-md hover:bg-primary-container transition-all active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Despesa</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar despesas..."
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-4 py-3 text-body-lg focus:outline-none focus:border-primary transition-colors" />
      </div>

      {/* List */}
      <div className="space-y-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl opacity-30 block mb-3">receipt_long</span>
            <p className="text-body-lg">Nenhuma despesa encontrada</p>
          </div>
        ) : filtered.map(item => {
          const catName = (item.category as { name: string } | null)?.name || 'Outros'
          const hasAttachments = item.attachments && item.attachments.length > 0
          return (
            <div key={item.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden card-hover">
              <div className="flex items-center justify-between p-md group">
                <div className="flex items-center gap-md flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error shrink-0">
                    <span className="material-symbols-outlined text-lg">trending_down</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-body-lg text-on-surface truncate">{item.name}</p>
                    <p className="text-body-sm text-on-surface-variant">{catName} · {formatDate(item.date)}</p>
                    {item.description && <p className="text-body-sm text-on-surface-variant truncate">{item.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-mono-data text-mono-data font-bold tnum text-error">
                    -{formatCurrency(item.value)}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setAttachTarget(item.id); fileInputRef.current?.click() }}
                      disabled={uploadingId === item.id}
                      className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                      title="Anexar Comprovante (Foto ou PDF)">
                      <Paperclip className={`w-3.5 h-3.5 ${uploadingId === item.id ? 'text-primary animate-spin' : 'text-on-surface-variant'}`} />
                    </button>
                    <button onClick={() => openForm(item)} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors">
                      <Edit2 className="w-3.5 h-3.5 text-on-surface-variant" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-error-container transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-error" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Attachments */}
              {hasAttachments && (
                <div className="px-md pb-md flex gap-2 flex-wrap">
                  {item.attachments!.map(att => {
                    const isPdf = att.file_name.toLowerCase().endsWith('.pdf') || att.file_type === 'application/pdf'
                    return (
                      <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[11px] bg-surface-container px-2 py-1 rounded-lg text-primary hover:bg-surface-container-high transition-colors">
                        {isPdf ? <FileText className="w-3 h-3 text-red-500" /> : <ImageIcon className="w-3 h-3" />}
                        <span className="truncate max-w-24">{att.file_name}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-lg border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
              <h3 className="text-headline-md font-headline-md">{editItem ? 'Editar' : 'Nova'} Despesa</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-surface-container transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-lg space-y-md pb-12">
              <div className="space-y-xs">
                <label className="text-label-md font-label-md text-on-surface-variant">Nome *</label>
                <input {...register('name')} placeholder="Ex: Internet" className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg focus:outline-none focus:border-primary transition-colors" />
                {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md font-label-md text-on-surface-variant">Valor (R$) *</label>
                  <input {...register('value')} type="number" step="0.01" placeholder="0,00" className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg focus:outline-none focus:border-primary transition-colors" />
                  {errors.value && <p className="text-xs text-error">{errors.value.message}</p>}
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md font-label-md text-on-surface-variant">Data *</label>
                  <input {...register('date')} type="date" className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md font-label-md text-on-surface-variant">Categoria</label>
                <select {...register('category_id')} className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg focus:outline-none focus:border-primary transition-colors">
                  <option value="">Selecionar...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md font-label-md text-on-surface-variant">Descrição</label>
                <input {...register('description')} placeholder="Detalhes da despesa" className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md font-label-md text-on-surface-variant">Observação</label>
                <textarea {...register('observation')} rows={2} placeholder="Opcional..." className="w-full bg-transparent border border-outline-variant rounded-lg p-sm text-body-lg focus:outline-none focus:border-primary transition-colors resize-none" />
              </div>

              {/* Receipt file selector inside modal */}
              <div className="space-y-xs">
                <label className="text-label-md font-label-md text-on-surface-variant">Nota Fiscal (Foto ou PDF)</label>
                <input
                  ref={formFileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFormPhotoSelect}
                  className="hidden"
                />
                {photoPreview ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-outline-variant bg-surface-container flex items-center justify-center">
                    {photoPreview === 'pdf' ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-red-500" />
                        <span className="text-body-sm font-semibold truncate max-w-xs">{selectedPhoto?.name}</span>
                      </div>
                    ) : (
                      <img src={photoPreview} alt="Comprovante" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => { setSelectedPhoto(null); setPhotoPreview(null) }}
                      className="absolute top-2 right-2 bg-error text-on-error p-1.5 rounded-full shadow hover:scale-105 transition-transform"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => formFileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-outline-variant rounded-lg p-md text-body-sm text-on-surface-variant hover:border-primary hover:text-primary transition-all"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Selecionar comprovante (Foto/PDF)</span>
                  </button>
                )}
              </div>

              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-primary text-on-primary py-md rounded-lg text-label-md font-label-md hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-60">
                {editItem ? 'Salvar alterações' : 'Adicionar Despesa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
