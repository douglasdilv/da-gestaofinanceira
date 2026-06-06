import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Expense, AppMode } from '@/types'
import { format } from 'date-fns'

interface ExpenseFilters {
  userId: string
  mode: AppMode
  year: number
  month: number
  companyId?: string | null
}

export function useExpenses({ userId, mode, year, month, companyId }: ExpenseFilters) {
  const qc = useQueryClient()
  const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd')
  const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd')

  const query = useQuery({
    queryKey: ['expenses', userId, mode, year, month, companyId],
    queryFn: async () => {
      let q = supabase
        .from('expenses')
        .select('*, category:categories(*), attachments(*)')
        .eq('user_id', userId)
        .eq('mode', mode)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })

      if (mode === 'business') {
        if (companyId) {
          q = q.eq('company_id', companyId)
        } else {
          q = q.is('company_id', null)
        }
      }

      const { data, error } = await q
      if (error) throw error
      return data as Expense[]
    },
    enabled: !!userId && (mode === 'personal' || (mode === 'business' && companyId !== undefined)),
  })

  const createMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'category' | 'attachments'>) => {
      const { data, error } = await supabase.from('expenses').insert(expense).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['cashflow-chart'] })
      qc.invalidateQueries({ queryKey: ['annual-report'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...expense }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase.from('expenses').update(expense).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['cashflow-chart'] })
      qc.invalidateQueries({ queryKey: ['annual-report'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['cashflow-chart'] })
      qc.invalidateQueries({ queryKey: ['annual-report'] })
    },
  })

  const uploadAttachment = async (file: File, expenseId: string, userId: string) => {
    const ext = file.name.split('.').pop()
    const path = `${userId}/${expenseId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(path, file)
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('attachments').getPublicUrl(path)
    const { error: dbError } = await supabase.from('attachments').insert({
      expense_id: expenseId,
      user_id: userId,
      file_url: data.publicUrl,
      file_name: file.name,
      file_type: file.type,
    })
    if (dbError) throw dbError
    qc.invalidateQueries({ queryKey: ['expenses'] })
    return data.publicUrl
  }

  const totalExpenses = query.data?.reduce((sum, e) => sum + e.value, 0) ?? 0

  return { ...query, createMutation, updateMutation, deleteMutation, uploadAttachment, totalExpenses }
}
