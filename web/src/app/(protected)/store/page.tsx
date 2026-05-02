import { createClient } from '@/utils/supabase/server'
import { Package, ExternalLink } from 'lucide-react'
import { trackClickAndRedirect } from './actions'

export const dynamic = 'force-dynamic'

export default async function StorePage() {
  const supabase = await createClient()
  
  const { data: packs } = await supabase
    .from('affiliate_links')
    .select('*')
    .eq('is_active', true)
    .order('pack_size', { ascending: true })

  return (
    <div className="p-4 pb-24 min-h-screen">
      <header className="pt-2 mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          Loja
          <Package className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Apoie o projeto comprando seus pacotes de figurinhas no Mercado Livre através dos nossos links.
        </p>
      </header>

      <div className="space-y-4 animate-in-fade">
        {packs?.map(pack => (
          <form action={trackClickAndRedirect} key={pack.id}>
            <input type="hidden" name="link_id" value={pack.id} />
            <input type="hidden" name="url" value={pack.url} />
            <button type="submit" className="w-full text-left">
              <div className="glass-card p-5 rounded-2xl flex items-center justify-between hover:bg-accent/50 transition-all active:scale-[0.98] group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{pack.label}</h3>
                    <p className="text-sm text-secondary font-semibold">{pack.price_text}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </button>
          </form>
        ))}

        {(!packs || packs.length === 0) && (
          <div className="text-center py-12 glass-card rounded-3xl">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Nenhum pacote disponível no momento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
