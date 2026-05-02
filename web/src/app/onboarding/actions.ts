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

  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const refCookie = cookieStore.get('fs_referral')?.value

  let referredBy = null
  if (refCookie) {
    const { data: referrer } = await supabase.from('profiles').select('id').eq('referral_code', refCookie).single()
    if (referrer) referredBy = referrer.id
  }

  // Verifica se já tem código de referral para não sobrescrever caso seja uma edição
  const { data: existingProfile } = await supabase.from('profiles').select('referral_code').eq('id', user.id).single()
  
  const myReferralCode = existingProfile?.referral_code || `${name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

  const updateData: any = {
    id: user.id,
    name,
    state,
    city,
    whatsapp,
    is_premium: false,
    reputation_score: existingProfile ? undefined : 0,
    referral_code: myReferralCode,
  }

  if (referredBy && !existingProfile?.referral_code) {
    updateData.referred_by = referredBy
  }

  const { error } = await supabase.from('profiles').upsert(updateData)

  // Se foi referido por alguém agora, tenta dar a recompensa
  if (referredBy && !existingProfile?.referral_code) {
    await supabase.rpc('grant_referral_reward', {
      p_new_user_id: user.id,
      p_referrer_id: referredBy
    })
  }

  if (error) {
    console.error('Error upserting profile:', error)
    throw new Error('Falha ao salvar o perfil.')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
