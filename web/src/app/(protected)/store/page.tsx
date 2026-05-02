import { createClient } from '@/utils/supabase/server'
import { Package, Coins, Crown } from 'lucide-react'
import { createCheckoutSession } from './actions'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function StorePage() {
  const supabase = await createClient()
  
  const { data: products } = await supabase
    .from('store_products')
    .select('*')
    .eq('is_active', true)
    .order('price_brl', { ascending: true })

  const credits = products?.filter(p => p.product_type === 'credits') || []
  const subscriptions = products?.filter(p => p.product_type === 'subscription') || []

  return (
    <div className="p-4 pb-24 min-h-screen">
      <header className="pt-2 mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          Loja
          <Package className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Adquira créditos para propor trocas ou torne-se Premium para ter benefícios exclusivos.
        </p>
      </header>

      {subscriptions.length > 0 && (
        <section className="mb-8 animate-in-fade">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" /> Assinaturas
          </h2>
          <div className="space-y-4">
            {subscriptions.map(sub => (
              <div key={sub.id} className="glass-card p-5 rounded-3xl border-2 border-yellow-500/20 bg-yellow-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-500 text-yellow-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl z-10">
                  Recomendado
                </div>
                <h3 className="font-black text-xl text-foreground mb-1">{sub.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{sub.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-foreground">
                    R$ {sub.price_brl.toFixed(2).replace('.', ',')} <span className="text-sm text-muted-foreground font-medium">/mês</span>
                  </p>
                  <form action={createCheckoutSession}>
                    <input type="hidden" name="productId" value={sub.id} />
                    <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold rounded-xl shadow-lg shadow-yellow-500/20">
                      Assinar
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {credits.length > 0 && (
        <section className="animate-in-fade" style={{animationDelay: '100ms'}}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" /> Pacotes de Créditos
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {credits.map(cred => (
              <div key={cred.id} className="glass-card p-4 rounded-2xl flex flex-col justify-between border border-primary/10 hover:border-primary/30 transition-colors">
                <div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm leading-tight mb-1">{cred.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{cred.description}</p>
                </div>
                <form action={createCheckoutSession}>
                  <input type="hidden" name="productId" value={cred.id} />
                  <Button type="submit" variant="secondary" className="w-full font-bold text-xs rounded-xl h-10 border border-secondary/20">
                    Comprar R$ {cred.price_brl.toFixed(2).replace('.', ',')}
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
