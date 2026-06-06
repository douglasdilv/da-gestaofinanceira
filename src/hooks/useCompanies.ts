import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Company } from '@/types'

export function useCompanies(userId: string | undefined) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['companies', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data as Company[]
    },
    enabled: !!userId,
  })

  const createMutation = useMutation({
    mutationFn: async (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('companies').insert(company).select().single()
      if (error) throw error
      return data as Company
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies', userId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Company> & { id: string }) => {
      const { data, error } = await supabase.from('companies').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as Company
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies', userId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('companies').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies', userId] })
    },
  })

  return { ...query, createMutation, updateMutation, deleteMutation }
}
