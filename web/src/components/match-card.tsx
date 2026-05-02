'use client'

import { MapPin, Star, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StickerInfo {
  id: string
  code: string
  name: string
}

interface MatchCardProps {
  match_user_id: string
  match_user_name: string
  match_user_state: string
  match_user_city: string
  match_rating_avg: number
  match_review_count: number
  they_give: StickerInfo[]
  they_want: StickerInfo[]
}

import { useRouter } from 'next/navigation'

export function MatchCard({
  match_user_id,
  match_user_name,
  match_user_state,
  match_user_city,
  match_rating_avg,
  match_review_count,
  they_give,
  they_want,
}: MatchCardProps) {
  const router = useRouter()

  const handleProposeTrade = () => {
    router.push(`/trades/new?match_id=${match_user_id}`)
  }

  return (
    <div className="glass-card rounded-3xl p-5 mb-6 animate-in-fade relative overflow-hidden">
      {/* Badge de Match */}
      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl z-10">
        Match Perfeito
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">{match_user_name}</h2>
          <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {match_user_city}, {match_user_state}
            </span>
            <span className="flex items-center gap-1 text-yellow-500 font-medium">
              <Star className="w-3 h-3 fill-current" />
              {match_rating_avg > 0 ? match_rating_avg.toFixed(1) : 'Novo'} 
              {match_review_count > 0 && <span className="text-muted-foreground/60 text-[10px]">({match_review_count})</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Áreas de Troca */}
      <div className="flex gap-2 items-stretch my-5">
        {/* Você Recebe */}
        <div className="flex-1 bg-secondary/10 rounded-2xl p-3 border border-secondary/20 relative">
          <p className="text-[10px] uppercase font-bold text-secondary mb-2">Você Recebe</p>
          <div className="space-y-1">
            {they_give.map(s => (
              <div key={s.id} className="text-xs font-medium text-foreground">
                <span className="bg-secondary/20 text-secondary px-1.5 py-0.5 rounded mr-1">
                  {s.code}
                </span>
                <span className="opacity-80">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ícone centralizador */}
        <div className="flex flex-col justify-center px-1">
          <div className="bg-background border border-border p-2 rounded-full shadow-sm z-10">
            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Você Envia */}
        <div className="flex-1 bg-primary/5 rounded-2xl p-3 border border-primary/10 relative">
          <p className="text-[10px] uppercase font-bold text-primary mb-2">Você Envia</p>
          <div className="space-y-1">
            {they_want.map(s => (
              <div key={s.id} className="text-xs font-medium text-foreground">
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded mr-1">
                  {s.code}
                </span>
                <span className="opacity-80">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button 
        onClick={handleProposeTrade} 
        className="w-full font-bold rounded-xl h-12 shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all"
      >
        Propor Troca
      </Button>
    </div>
  )
}
