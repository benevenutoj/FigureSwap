'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function rerollMatches() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Não autenticado' }

  // Verificar saldo
  const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single()
  
  if (!profile || profile.credits < 1) {
    return { error: 'Sem créditos suficientes' }
  }

  // Deduzir 1 crédito
  const { error } = await supabase.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id)

  if (error) {
    return { error: 'Erro ao processar re-roll' }
  }

  revalidatePath('/explore')
  revalidatePath('/profile')
  return { success: true }
}
