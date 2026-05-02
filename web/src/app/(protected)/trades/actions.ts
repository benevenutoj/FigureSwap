'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Props para facilitar a criação
type TradeItemData = {
  sender_id: string
  sticker_id: string
  quantity: number
}

export async function createTradeProposal(receiverId: string, items: TradeItemData[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // 1. Create Trade
  const { data: trade, error: tradeError } = await supabase
    .from('trades')
    .insert({
      proposer_id: user.id,
      receiver_id: receiverId,
      status: 'pending'
    })
    .select()
    .single()

  if (tradeError || !trade) {
    console.error(tradeError)
    throw new Error('Erro ao criar proposta de troca')
  }

  // 2. Add Items
  const itemsWithTradeId = items.map(item => ({
    ...item,
    trade_id: trade.id
  }))

  const { error: itemsError } = await supabase
    .from('trade_items')
    .insert(itemsWithTradeId)

  if (itemsError) {
    console.error(itemsError)
    throw new Error('Erro ao adicionar figurinhas na proposta')
  }

  revalidatePath('/trades')
  redirect('/trades')
}

export async function updateStatus(tradeId: string, newStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Call the secure RPC function
  const { error } = await supabase.rpc('update_trade_status', {
    p_trade_id: tradeId,
    p_new_status: newStatus,
    p_user_id: user.id
  })

  if (error) {
    console.error(error)
    throw new Error(`Erro ao atualizar para status: ${newStatus} (${error.message})`)
  }

  revalidatePath('/trades')
  revalidatePath(`/trades/${tradeId}`)
  revalidatePath('/inventory') // Inventory might change if scheduled or completed
}
