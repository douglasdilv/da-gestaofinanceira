import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Goal, AppMode } from '@/types'

export function useGoals(userId: string | undefined, mode: AppMode) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['goals', userId, mode],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('mode', mode)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Goal[]
    },
    enabled: !!userId,
  })

  const createMutation = useMutation({
    mutationFn: async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('goals').insert(goal).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...goal }: Partial<Goal> & { id: string }) => {
      const { data, error } = await supabase.from('goals').update(goal).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  return { ...query, createMutation, updateMutation, deleteMutation }
}
