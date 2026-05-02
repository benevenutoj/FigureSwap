'use client'

import { useState } from 'react'
import { MatchCard } from '@/components/match-card'
import { Search, Flame, Compass, Loader2, Lock, Crown, RefreshCw, Coins } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { rerollMatches } from './actions'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface TopWanted {
  sticker_id: string
  code: string
  name: string
  team_name: string
  wanted_count: number
}

interface ExploreClientProps {
  initialMatches: any[]
  topWanted: TopWanted[]
  credits: number
  userId: string
  isPremium: boolean
}

export function ExploreClient({ initialMatches, topWanted, credits: initialCredits, userId, isPremium }: ExploreClientProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [credits, setCredits] = useState(initialCredits)
  const [isRerolling, setIsRerolling] = useState(false)
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    const supabase = createClient()
    const { data } = await supabase.rpc('search_users_by_sticker', {
      p_query: query.trim(),
      p_user_id: userId
    })
    
    setSearchResults(data || [])
    setIsSearching(false)
  }

  const handleReroll = async () => {
    setIsRerolling(true)
    const res = await rerollMatches()
    if (res?.error) {
      alert(res.error)
    } else {
      setCredits(c => Math.max(0, c - 1))
    }
    setTimeout(() => {
      setIsRerolling(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 800)
  }

  const isSearchMode = query.trim().length > 0

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <Input 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value === '') setSearchResults([])
          }}
          placeholder="Buscar figurinha por nome ou código..."
          className="pl-10 pr-24 h-12 bg-background/50 rounded-2xl border-border/50 shadow-sm text-base"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary font-bold text-sm bg-primary/10 hover:bg-primary/20 transition-colors px-4 py-1.5 rounded-xl">
          Buscar
        </button>
      </form>

      {/* TOP 5 MAIS DESEJADAS */}
      {!isSearchMode && topWanted.length > 0 && (
        <section className="animate-in-fade">
          <h2 className="text-lg font-black text-foreground mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> Em Alta
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {topWanted.map((item, index) => (
              <div key={item.sticker_id} className="min-w-[150px] min-h-[100px] glass-card p-4 rounded-2xl border border-orange-500/10 bg-orange-500/5 relative shrink-0 flex flex-col justify-between">
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg">
                  {index + 1}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 mt-1 truncate">{item.team_name}</p>
                  <p className="font-black text-foreground leading-tight text-sm mb-2">{item.name}</p>
                </div>
                <div className="bg-orange-500/20 text-orange-700 dark:text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded flex w-fit items-center gap-1">
                  <Flame className="w-3 h-3" /> {item.wanted_count} procuram
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BUSCA: RESULTADOS */}
      {isSearchMode && (
        <section>
          <h2 className="text-lg font-black text-foreground mb-4">Quem tem essa figurinha</h2>
          {isSearching ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Ninguém encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Nenhum usuário possui essa figurinha repetida no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((match: any) => (
                <div key={match.match_user_id} className="glass-card rounded-3xl p-5 border border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-foreground">{match.match_user_name}</p>
                      <p className="text-xs text-muted-foreground">{match.match_user_city}, {match.match_user_state}</p>
                    </div>
                    <div className="text-xs text-muted-foreground bg-secondary/20 px-2 py-1 rounded-lg">
                      ⭐ {match.match_user_reputation?.toFixed(1) || 'Novo'}
                    </div>
                  </div>

                  {match.they_give && match.they_give.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase font-bold text-primary mb-1">Tem para dar:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.they_give.slice(0, 4).map((s: any) => (
                          <span key={s.id} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{s.code}</span>
                        ))}
                        {match.they_give.length > 4 && (
                          <span className="text-[10px] px-2 py-0.5 bg-muted/50 text-muted-foreground rounded-full">+{match.they_give.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {match.they_want && match.they_want.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] uppercase font-bold text-orange-500 mb-1">Procura em troca:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.they_want.slice(0, 4).map((s: any) => (
                          <span key={s.id} className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-600 rounded-full font-medium">{s.code}</span>
                        ))}
                        {match.they_want.length > 4 && (
                          <span className="text-[10px] px-2 py-0.5 bg-muted/50 text-muted-foreground rounded-full">+{match.they_want.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <Link href={`/trades/new?with=${match.match_user_id}&sticker=${match.they_give?.[0]?.id || ''}`}>
                    <Button size="sm" className="w-full rounded-xl font-bold text-sm h-10">
                      Propor Troca
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* MATCHES PERFEITOS (quando não há busca ativa) */}
      {!isSearchMode && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              {!isPremium && <Lock className="w-4 h-4 text-muted-foreground" />}
              Matches Perfeitos
            </h2>
            {isPremium && initialMatches.length > 0 && (
              <Button
                onClick={handleReroll}
                disabled={isRerolling || credits < 1}
                size="sm"
                variant="outline"
                className="rounded-xl font-bold flex items-center gap-1.5 h-9"
              >
                <RefreshCw className={`w-4 h-4 ${isRerolling ? 'animate-spin' : ''}`} />
                Re-roll
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-1">
                  1 <Coins className="w-3 h-3" />
                </span>
              </Button>
            )}
          </div>

          {!isPremium ? (
            <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center border border-primary/20 bg-primary/5">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Função Premium</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Os Matches Perfeitos encontram automaticamente quem quer o que você tem e tem o que você quer. Assine o Premium para desbloquear!
              </p>
              <Link href="/store">
                <Button className="rounded-xl font-bold flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Ver Planos
                </Button>
              </Link>
            </div>
          ) : initialMatches.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center mt-2">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Compass className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Sem Matches Perfeitos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Não encontramos trocas perfeitas baseadas no seu inventário atual.
              </p>
              <p className="text-xs text-primary font-medium">
                Dica: Use a busca acima para encontrar a figurinha que você quer!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {initialMatches.map((match: any) => (
                <MatchCard key={match.match_user_id} {...match} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
