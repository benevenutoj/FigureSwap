import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CustomTradeClient } from './custom-trade-client'

export const dynamic = 'force-dynamic'

export default async function NewTradePage({
  searchParams
}: {
  searchParams: Promise<{ match_id?: string, with?: string, sticker?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const params = await searchParams
  const { match_id, with: targetUserId, sticker: targetStickerId } = params

  if (!user || (!match_id && !targetUserId)) {
    redirect('/explore')
  }

  let isPerfectMatch = false
  let targetUser: any = null
  let targetSticker: any = null
  let theyGive: any[] = []
  let theyWant: any[] = []
  let myRepeatedStickers: any[] = []

  // CENÁRIO 1: MATCH PERFEITO
  if (match_id) {
    isPerfectMatch = true
    const { data: matches } = await supabase.rpc('get_user_matches', {
      p_user_id: user.id
    })
    const match = matches?.find((m: any) => m.match_user_id === match_id)
    if (!match) {
      return (
        <div className="p-4 pt-10 text-center">
          <h1 className="text-xl font-bold mb-2">Match não encontrado</h1>
          <p className="text-muted-foreground">O usuário pode não ter mais as figurinhas disponíveis.</p>
        </div>
      )
    }
    
    targetUser = {
      id: match.match_user_id,
      name: match.match_user_name,
      city: match.match_user_city,
      state: match.match_user_state
    }
    theyGive = match.they_give || []
    theyWant = match.they_want || []
  } 
  
  // CENÁRIO 2: BUSCA CUSTOMIZADA
  else if (targetUserId) {
    // 1. Perfil do alvo
    const { data: profile } = await supabase.from('profiles').select('id, name, city, state').eq('id', targetUserId).single()
    if (!profile) redirect('/explore')
    targetUser = profile

    // 2. Figurinha alvo
    if (targetStickerId) {
      const { data: s } = await supabase.from('stickers').select('id, code, name').eq('id', targetStickerId).single()
      targetSticker = s
    }

    // 3. Minhas repetidas (owned_quantity > 1)
    const { data: inv } = await supabase
      .from('user_inventory')
      .select('sticker_id')
      .eq('user_id', user.id)
      .gt('owned_quantity', 1)

    if (inv && inv.length > 0) {
      const ids = inv.map(i => i.sticker_id)
      const { data: stks } = await supabase
        .from('stickers')
        .select('id, code, name')
        .in('id', ids)
        .order('code')
      myRepeatedStickers = stks || []
    }
  }

  return (
    <div className="p-4 pb-24 min-h-screen">
      <header className="pt-2 mb-8">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Propor Troca
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isPerfectMatch 
            ? `Confirme os detalhes do match perfeito com ${targetUser?.name}.`
            : `Proponha uma troca customizada para ${targetUser?.name}.`
          }
        </p>
      </header>

      {targetUser && (
        <CustomTradeClient 
          currentUserId={user.id}
          targetUser={targetUser}
          targetSticker={targetSticker}
          myRepeatedStickers={myRepeatedStickers}
          theyGive={theyGive}
          theyWant={theyWant}
          isPerfectMatch={isPerfectMatch}
        />
      )}
    </div>
  )
}
