'use client'

import { useState } from 'react'
import { MatchCard } from '@/components/match-card'
import { Search, Flame, Compass, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { RerollButton } from './reroll-button'
import { createClient } from '@/utils/supabase/client'

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
}

export function ExploreClient({ initialMatches, topWanted, credits, userId }: ExploreClientProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  
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

  const isSearchMode = query.trim().length > 0 && searchResults.length >= 0

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
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {topWanted.map((item, index) => (
              <div key={item.sticker_id} className="min-w-[140px] glass-card p-3 rounded-2xl border border-orange-500/10 bg-orange-500/5 relative shrink-0">
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg">
                  {index + 1}
                </div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 mt-1 truncate">{item.team_name}</p>
                <p className="font-black text-foreground leading-tight text-sm mb-2 line-clamp-1">{item.name}</p>
                <div className="bg-orange-500/20 text-orange-700 dark:text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded flex w-fit items-center gap-1">
                  <Flame className="w-3 h-3" /> {item.wanted_count} procuram
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MATCHES OU RESULTADOS DE BUSCA */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-foreground">
            {isSearchMode ? 'Resultados da Busca' : 'Matches Perfeitos'}
          </h2>
          {!isSearchMode && initialMatches.length > 0 && (
            <RerollButton credits={credits} />
          )}
        </div>

        {isSearching ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isSearchMode ? (
          searchResults.length === 0 ? (
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
                <MatchCard key={match.match_user_id} {...match} />
              ))}
            </div>
          )
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
    </div>
  )
}
