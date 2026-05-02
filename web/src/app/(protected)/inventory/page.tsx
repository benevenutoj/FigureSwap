import { createClient } from '@/utils/supabase/server'
import { StickerCard } from '@/components/sticker-card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search } from 'lucide-react'

// O Next.js fará o cache dessa rota dinamicamente devido à leitura de cookies no server client
export const dynamic = 'force-dynamic'

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const resolvedParams = await searchParams
  const query = resolvedParams.q?.toLowerCase() || ''

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
      category: sticker.category,
      owned_quantity: inv?.owned_quantity || 0,
      reserved_quantity: inv?.reserved_quantity || 0,
      is_wanted: inv?.is_wanted || false,
    }
  })

  // 4. Apply search filter
  const filteredData = mergedData.filter(s => 
    s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query)
  )

  const ownedStickers = filteredData.filter(s => s.owned_quantity > 0)
  const wantedStickers = filteredData.filter(s => s.is_wanted)

  return (
    <div className="p-4 pb-24 min-h-screen space-y-6">
      <header className="pt-2">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Meu Álbum</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie suas figurinhas repetidas e faltantes.
        </p>
      </header>

      {/* Busca visual simples - Em um app real, seria um Client Component para atualizar a URL sem reload completo, mas para o MVP usaremos form */}
      <form className="relative" method="GET">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          name="q"
          defaultValue={query}
          placeholder="Buscar por nome ou código..."
          className="pl-9 h-12 bg-background/50 glass-card rounded-xl border-border/50 text-base"
        />
      </form>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 rounded-xl bg-background/50 glass-card border border-border/50 mb-6">
          <TabsTrigger value="all" className="rounded-lg">Todas</TabsTrigger>
          <TabsTrigger value="owned" className="rounded-lg">Repetidas</TabsTrigger>
          <TabsTrigger value="wanted" className="rounded-lg">Faltantes</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-0">
          {filteredData.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Nenhuma figurinha encontrada.</p>
          ) : (
            filteredData.map(s => <StickerCard key={s.sticker_id} {...s} />)
          )}
        </TabsContent>

        <TabsContent value="owned" className="space-y-3 mt-0">
          {ownedStickers.length === 0 ? (
            <div className="text-center py-10 glass-card rounded-2xl">
              <p className="text-muted-foreground">Você ainda não tem repetidas.</p>
              <p className="text-xs text-muted-foreground mt-2">Adicione figurinhas na aba "Todas".</p>
            </div>
          ) : (
            ownedStickers.map(s => <StickerCard key={s.sticker_id} {...s} />)
          )}
        </TabsContent>

        <TabsContent value="wanted" className="space-y-3 mt-0">
          {wantedStickers.length === 0 ? (
            <div className="text-center py-10 glass-card rounded-2xl">
              <p className="text-muted-foreground">Você não marcou nenhuma como faltante.</p>
              <p className="text-xs text-muted-foreground mt-2">Clique na estrela para adicionar.</p>
            </div>
          ) : (
            wantedStickers.map(s => <StickerCard key={s.sticker_id} {...s} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
