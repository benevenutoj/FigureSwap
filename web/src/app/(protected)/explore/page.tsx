import { createClient } from '@/utils/supabase/server'
import { Compass, Coins } from 'lucide-react'
import { ExploreClient } from './explore-client'

// Força o Next.js a sempre rodar dinamicamente esta rota
export const dynamic = 'force-dynamic'

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Puxa os matches perfeitos
  const { data: matches, error } = await supabase.rpc('get_user_matches', {
    p_user_id: user.id
  })

  // 2. Puxa o Top 5 mais desejadas
  const { data: topWanted } = await supabase.rpc('get_top_wanted_stickers')

  // 3. Puxa os créditos do perfil
  const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single()
  const credits = profile?.credits || 0

  // Embaralha levemente os matches perfeitos
  const displayMatches = matches ? [...matches].sort(() => Math.random() - 0.5) : []
  const displayTopWanted = topWanted || []

  return (
    <div className="p-4 pb-24 min-h-screen">
      <header className="pt-2 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            Explorar
            <Compass className="w-6 h-6 text-primary" />
          </h1>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold flex items-center gap-1.5 text-sm">
            {credits} <Coins className="w-4 h-4" />
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Descubra figurinhas, encontre colecionadores e faça trocas.
        </p>
      </header>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-center text-sm mb-6">
          Erro ao carregar dados do Explorar.
        </div>
      )}

      {!error && (
        <ExploreClient 
          initialMatches={displayMatches} 
          topWanted={displayTopWanted} 
          credits={credits} 
          userId={user.id} 
        />
      )}
    </div>
  )
}
