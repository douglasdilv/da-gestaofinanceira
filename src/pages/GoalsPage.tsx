import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useGoals } from '@/hooks/useGoals'
import { useAppStore } from '@/store/appStore'
import { formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, X, Trash2, Edit2 } from 'lucide-react'
import { ModeToggle } from '@/components/shared/ModeToggle'
import { GoalCard } from '@/components/dashboard/GoalCard'
import type { Goal } from '@/types'

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  description: z.string().optional(),
  target_amount: z.coerce.number().positive('Valor deve ser positivo'),
  current_amount: z.coerce.number().min(0).default(0),
  deadline: z.string().optional(),
  icon: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const goalIcons = [
  { value: 'savings', label: 'Poupança' },
  { value: 'home', label: 'Casa' },
  { value: 'directions_car', label: 'Carro' },
  { value: 'flight', label: 'Viagem' },
  { value: 'school', label: 'Educação' },
  { value: 'health_and_safety', label: 'Saúde' },
  { value: 'business', label: 'Negócio' },
  { value: 'smartphone', label: 'Tech' },
]

export default function GoalsPage() {
  const { user } = useAuth()
  const { mode } = useAppStore()
  const location = useLocation()
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Goal | null>(null)

  const { data: goals = [], createMutation, updateMutation, deleteMutation } = useGoals(user?.id, mode)

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { current_amount: 0, icon: 'savings' },
  })

  const selectedIcon = watch('icon')

  const openForm = (item?: Goal) => {
    if (item) {
      setEditItem(item)
      reset({ title: item.title, description: item.description || '', target_amount: item.target_amount, current_amount: item.current_amount, deadline: item.deadline || '', icon: item.icon || 'savings' })
    } else {
      setEditItem(null)
      reset({ current_amount: 0, icon: 'savings' })
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
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, ...data, deadline: data.deadline || null, description: data.description || null, icon: data.icon || null })
        toast.success('Meta atualizada!')
      } else {
        await createMutation.mutateAsync({ ...data, user_id: user.id, mode, deadline: data.deadline || null, description: data.description || null, icon: data.icon || null, color: null })
        toast.success('Meta criada!')
      }
      setShowForm(false)
    } catch {
      toast.error('Erro ao salvar meta')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta meta?')) return
    await deleteMutation.mutateAsync(id)
    toast.success('Meta excluída')
  }

  const totalTargeted = goals.reduce((s, g) => s + g.target_amount, 0)
  const totalCurrent = goals.reduce((s, g) => s + g.current_amount, 0)

  return (
    <div className="py-lg space-y-lg">
      <ModeToggle />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-lg-mobile font-headline-lg text-on-surface">Metas Financeiras</h2>
          <p className="text-body-sm text-on-surface-variant mt-0.5">{goals.length} meta{goals.length !== 1 ? 's' : ''} ativa{goals.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => openForm()}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg text-label-md font-label-md hover:bg-primary-container transition-all active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Meta</span>
        </button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="grid grid-cols-2 gap-gutter">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-md">
            <p className="text-label-md text-primary mb-1">Total Planejado</p>
            <p className="text-xl font-bold tnum text-primary">{formatCurrency(totalTargeted)}</p>
          </div>
          <div className="bg-tertiary-container/30 border border-tertiary/20 rounded-xl p-md">
            <p className="text-label-md text-tertiary mb-1">Total Alcançado</p>
            <p className="text-xl font-bold tnum text-tertiary">{formatCurrency(totalCurrent)}</p>
          </div>
        </div>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl opacity-30 block mb-4">flag</span>
          <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Nenhuma meta</h3>
          <p className="text-body-sm text-on-surface-variant mb-6">Crie sua primeira meta financeira e acompanhe seu progresso.</p>
          <button onClick={() => openForm()} className="bg-primary text-on-primary px-6 py-md rounded-lg text-label-md font-label-md hover:bg-primary-container transition-all">
            Criar primeira meta
          </button>
        </div>
      ) : (
        <div className="space-y-sm">
          {goals.map(goal => (
            <div key={goal.id} className="relative group">
              <GoalCard goal={goal} />
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openForm(goal)} className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
                  <Edit2 className="w-3.5 h-3.5 text-on-surface-variant" />
                </button>
                <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg bg-surface-container hover:bg-error-container transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-error" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-lg border-b border-outline-variant sticky top-0 bg-surface-container-lowest">
              <h3 className="text-headline-md font-headline-md">{editItem ? 'Editar' : 'Nova'} Meta</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-surface-container transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-lg space-y-md pb-12">
              {/* Icon picker */}
              <div className="space-y-xs">
                <label className="text-label-md font-label-md text-on-surface-variant">Ícone</label>
                <div className="flex gap-2 flex-wrap">
                  {goalIcons.map(ic => (
                    <button key={ic.value} type="button" onClick={() => setValue('icon', ic.value)}
                      className={`p-2 rounded-xl border-2 transition-all ${selectedIcon === ic.value ? 'border-primary bg-primary/10' : 'border-outline-variant hover:border-primary/50'}`}>
                      <span className="material-symbols-outlined text-lg">{ic.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-xs">
                <label className="text-label-md font-label-md text-on-surface-variant">Título *</label>
                <input {...register('title')} placeholder="Ex: Reserva de Emergência" className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg focus:outline-none focus:border-primary transition-colors" />
                {errors.title && <p className="text-xs text-error">{errors.title.message}</p>}
              </div>

              <div className="space-y-xs">
                <label className="text-label-md font-label-md text-on-surface-variant">Descrição</label>
                <input {...register('description')} placeholder="Detalhes da meta..." className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg focus:outline-none focus:border-primary transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md font-label-md text-on-surface-variant">Meta (R$) *</label>
                  <input {...register('target_amount')} type="number" step="0.01" placeholder="0,00" className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg focus:outline-none focus:border-primary transition-colors" />
                  {errors.target_amount && <p className="text-xs text-error">{errors.target_amount.message}</p>}
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md font-label-md text-on-surface-variant">Atual (R$)</label>
                  <input {...register('current_amount')} type="number" step="0.01" placeholder="0,00" className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="text-label-md font-label-md text-on-surface-variant">Prazo</label>
                <input {...register('deadline')} type="date" className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg focus:outline-none focus:border-primary transition-colors" />
              </div>

              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-primary text-on-primary py-md rounded-lg text-label-md font-label-md hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-60">
                {editItem ? 'Salvar alterações' : 'Criar Meta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
