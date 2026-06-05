import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Income, AppMode } from '@/types'
import { format } from 'date-fns'

interface IncomeFilters {
  userId: string
  mode: AppMode
  year: number
  month: number
}

export function useIncomes({ userId, mode, year, month }: IncomeFilters) {
  const qc = useQueryClient()
  const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd')
  const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd')

  const query = useQuery({
    queryKey: ['incomes', userId, mode, year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incomes')
        .select('*, category:categories(*), attachments(*)')
        .eq('user_id', userId)
        .eq('mode', mode)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
      if (error) throw error
      return data as Income[]
    },
    enabled: !!userId,
  })

  const createMutation = useMutation({
    mutationFn: async (income: Omit<Income, 'id' | 'created_at' | 'updated_at' | 'category' | 'attachments'>) => {
      const { data, error } = await supabase.from('incomes').insert(income).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['cashflow-chart'] })
      qc.invalidateQueries({ queryKey: ['annual-report'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...income }: Partial<Income> & { id: string }) => {
      const { data, error } = await supabase.from('incomes').update(income).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['cashflow-chart'] })
      qc.invalidateQueries({ queryKey: ['annual-report'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('incomes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['cashflow-chart'] })
      qc.invalidateQueries({ queryKey: ['annual-report'] })
    },
  })

  const uploadAttachment = async (file: File, incomeId: string, userId: string) => {
    const ext = file.name.split('.').pop()
    const path = `${userId}/${incomeId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(path, file)
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('attachments').getPublicUrl(path)
    const { error: dbError } = await supabase.from('attachments').insert({
      income_id: incomeId,
      user_id: userId,
      file_url: data.publicUrl,
      file_name: file.name,
      file_type: file.type,
    })
    if (dbError) throw dbError
    qc.invalidateQueries({ queryKey: ['incomes'] })
    return data.publicUrl
  }

  const totalIncome = query.data?.reduce((sum, i) => sum + i.value, 0) ?? 0

  return { ...query, createMutation, updateMutation, deleteMutation, uploadAttachment, totalIncome }
}
