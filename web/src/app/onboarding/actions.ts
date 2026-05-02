'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function completeProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Não autenticado')
  }

  const name = formData.get('name') as string
  const state = formData.get('state') as string
  const city = formData.get('city') as string
  const whatsapp = formData.get('whatsapp') as string

  if (!name || !state || !city || !whatsapp) {
    throw new Error('Preencha todos os campos.')
  }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name,
    state,
    city,
    whatsapp,
    is_premium: false,
    reputation_score: 0
  })

  if (error) {
    console.error('Error upserting profile:', error)
    throw new Error('Falha ao salvar o perfil.')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
