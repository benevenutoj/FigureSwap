'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOwnedQuantity(stickerId: string, newQuantity: number) {
  if (newQuantity < 0) return { error: 'Quantity cannot be negative' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  // Use upsert to handle both insert and update
  const { error } = await supabase
    .from('user_inventory')
    .upsert({
      user_id: user.id,
      sticker_id: stickerId,
      owned_quantity: newQuantity,
      // reserved_quantity should default to 0 on insert, but we shouldn't overwrite it on update
      // Supabase upsert will keep existing values for columns not provided if the row exists
    }, { onConflict: 'user_id, sticker_id' })

  if (error) {
    console.error('Error updating quantity:', error)
    return { error: 'Failed to update quantity' }
  }

  revalidatePath('/inventory')
  return { success: true }
}

export async function toggleWantedSticker(stickerId: string, isWanted: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_inventory')
    .upsert({
      user_id: user.id,
      sticker_id: stickerId,
      is_wanted: isWanted,
    }, { onConflict: 'user_id, sticker_id' })

  if (error) {
    console.error('Error toggling wanted status:', error)
    return { error: 'Failed to update status' }
  }

  revalidatePath('/inventory')
  return { success: true }
}
