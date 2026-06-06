import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Category, AppMode } from '@/types'

export function useCategories(userId: string | undefined, type?: 'income' | 'expense', mode?: AppMode) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['categories', userId, type, mode],
    queryFn: async () => {
      if (!userId) return []
      let q = supabase.from('categories').select('*').eq('user_id', userId)
      if (type) q = q.eq('type', type)
      if (mode) q = q.eq('mode', mode)
      let { data, error } = await q.order('name')
      if (error) throw error
      
      // Auto-heal: if categories are empty for this mode, seed them
      if ((!data || data.length === 0) && userId) {
        await seedDefaultCategories(userId)
        const retry = await q.order('name')
        data = retry.data
      } else if (type === 'expense' && data && !data.find(c => c.name === 'Cartão de Crédito')) {
        // Auto-inject missing Cartão de Crédito category for existing users
        await supabase.from('categories').insert({
          user_id: userId,
          name: 'Cartão de Crédito',
          type: 'expense',
          mode: mode || 'personal',
          icon: 'credit_card',
          color: mode === 'business' ? '#6366f1' : '#10b981'
        })
        const retry = await q.order('name')
        data = retry.data
      }
      
      return data as Category[]
    },
    enabled: !!userId,
  })

  const createMutation = useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('categories').insert(category).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })

  return { ...query, createMutation }
}

// Default categories seeder
export async function seedDefaultCategories(userId: string) {
  const personalIncomeCategories = [
    { name: 'Salário', icon: 'payments', color: '#10b981' },
    { name: 'Freelancer', icon: 'work', color: '#6366f1' },
    { name: 'Comissão', icon: 'trending_up', color: '#f59e0b' },
    { name: 'Venda', icon: 'sell', color: '#3b82f6' },
    { name: 'iFood', icon: 'restaurant', color: '#ef4444' },
    { name: 'Outros', icon: 'more_horiz', color: '#8b5cf6' },
  ]
  const personalExpenseCategories = [
    { name: 'Alimentação', icon: 'restaurant', color: '#ef4444' },
    { name: 'Transporte', icon: 'directions_car', color: '#f59e0b' },
    { name: 'Moradia', icon: 'home', color: '#3b82f6' },
    { name: 'Saúde', icon: 'health_and_safety', color: '#10b981' },
    { name: 'Educação', icon: 'school', color: '#8b5cf6' },
    { name: 'Lazer', icon: 'sports_esports', color: '#ec4899' },
    { name: 'Vestuário', icon: 'checkroom', color: '#6366f1' },
    { name: 'Cartão de Crédito', icon: 'credit_card', color: '#10b981' },
    { name: 'Outros', icon: 'more_horiz', color: '#6b7280' },
  ]
  const bizIncomeCategories = [
    { name: 'Produto', icon: 'inventory_2', color: '#10b981' },
    { name: 'Serviço', icon: 'build', color: '#6366f1' },
    { name: 'Assinatura', icon: 'subscriptions', color: '#f59e0b' },
    { name: 'Marketplace', icon: 'storefront', color: '#3b82f6' },
    { name: 'iFood', icon: 'restaurant', color: '#ef4444' },
    { name: 'Outros', icon: 'more_horiz', color: '#8b5cf6' },
  ]
  const bizExpenseCategories = [
    { name: 'Marketing', icon: 'campaign', color: '#ef4444' },
    { name: 'Software & SaaS', icon: 'terminal', color: '#6366f1' },
    { name: 'Logística', icon: 'local_shipping', color: '#f59e0b' },
    { name: 'Pessoal', icon: 'people', color: '#3b82f6' },
    { name: 'Infraestrutura', icon: 'business', color: '#10b981' },
    { name: 'Impostos', icon: 'account_balance', color: '#ec4899' },
    { name: 'Cartão de Crédito', icon: 'credit_card', color: '#6366f1' },
    { name: 'Outros', icon: 'more_horiz', color: '#6b7280' },
  ]

  const toInsert = [
    ...personalIncomeCategories.map(c => ({ ...c, user_id: userId, type: 'income' as const, mode: 'personal' as const })),
    ...personalExpenseCategories.map(c => ({ ...c, user_id: userId, type: 'expense' as const, mode: 'personal' as const })),
    ...bizIncomeCategories.map(c => ({ ...c, user_id: userId, type: 'income' as const, mode: 'business' as const })),
    ...bizExpenseCategories.map(c => ({ ...c, user_id: userId, type: 'expense' as const, mode: 'business' as const })),
  ]

  await supabase.from('categories').insert(toInsert)
}
