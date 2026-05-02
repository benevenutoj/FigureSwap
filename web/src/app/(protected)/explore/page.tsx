import { createClient } from '@/utils/supabase/server'
import { MatchCard } from '@/components/match-card'
import { Compass, Coins } from 'lucide-react'
import { RerollButton } from './reroll-button'

// Força o Next.js a sempre rodar dinamicamente esta rota
export const dynamic = 'force-dynamic'

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Chama a função RPC criada no banco de dados para o motor de matching
  const { data: matches, error } = await supabase.rpc('get_user_matches', {
    p_user_id: user.id
  })

  // Fetch profile credits
  const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single()
  const credits = profile?.credits || 0

  // Embaralha levemente para dar o efeito de Re-roll
  const displayMatches = matches ? [...matches].sort(() => Math.random() - 0.5) : []

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
          Encontramos esses colecionadores compatíveis com o seu inventário.
        </p>
      </header>

      {displayMatches.length > 0 && (
        <div className="mb-6">
          <RerollButton credits={credits} />
        </div>
      )}

      <section>
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-center text-sm">
            Erro ao carregar matches.
          </div>
        )}

        {!error && (!matches || matches.length === 0) ? (
          <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center mt-10">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Compass className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Nenhum Match Encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Continue adicionando figurinhas repetidas e faltantes no seu Inventário para encontrar outros colecionadores.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayMatches?.map((match: any) => (
              <MatchCard 
                key={match.match_user_id}
                match_user_id={match.match_user_id}
                match_user_name={match.match_user_name}
                match_user_state={match.match_user_state}
                match_user_city={match.match_user_city}
                match_user_reputation={match.match_user_reputation}
                they_give={match.they_give}
                they_want={match.they_want}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
