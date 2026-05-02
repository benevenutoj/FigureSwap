'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function trackClickAndRedirect(formData: FormData) {
  const link_id = formData.get('link_id') as string
  const url = formData.get('url') as string

  if (!link_id || !url) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Registra o clique para analytics (fire and forget, não precisa falhar o redirecionamento se der erro aqui)
    await supabase.from('link_clicks').insert({
      user_id: user.id,
      link_id: link_id
    })
  }

  // Redireciona para a URL do afiliado (ex: Mercado Livre)
  redirect(url)
}
