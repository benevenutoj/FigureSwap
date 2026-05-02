import { createClient } from '@/utils/supabase/server'
import { Book } from 'lucide-react'
import { AlbumClient } from './album-client'

// O Next.js fará o cache dessa rota dinamicamente devido à leitura de cookies no server client
export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch ALL stickers
  const { data: stickers } = await supabase
    .from('stickers')
    .select('*')
    .order('code', { ascending: true })

  // 2. Fetch User Inventory
  const { data: inventory } = await supabase
    .from('user_inventory')
    .select('*')
    .eq('user_id', user?.id)

  // 3. Merge them
  const mergedData = (stickers || []).map(sticker => {
    const inv = inventory?.find(i => i.sticker_id === sticker.id)
    return {
      id: inv?.id || `new-${sticker.id}`,
      sticker_id: sticker.id,
      code: sticker.code,
      name: sticker.name,
      team: sticker.team_name || sticker.team || '',
      group_name: sticker.group_name || '',
      owned_quantity: inv?.owned_quantity || 0,
      reserved_quantity: inv?.reserved_quantity || 0,
      is_wanted: inv?.is_wanted || false,
    }
  })

  return (
    <div className="p-4 pb-24 min-h-screen space-y-6">
      <header className="pt-2">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          Meu Álbum
          <Book className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie suas figurinhas repetidas e faltantes.
        </p>
      </header>

      <AlbumClient stickers={mergedData} />
    </div>
  )
}

