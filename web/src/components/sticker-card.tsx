'use client'

import { useState, useTransition } from 'react'
import { Plus, Minus, Star, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateOwnedQuantity, toggleWantedSticker } from '@/app/(protected)/meu-album/actions'

interface StickerCardProps {
  id: string
  sticker_id: string
  code: string
  name: string
  team?: string
  group_name?: string
  owned_quantity: number
  reserved_quantity: number
  is_wanted: boolean
}

export function StickerCard({
  id,
  sticker_id,
  code,
  name,
  team,
  group_name,
  owned_quantity,
  reserved_quantity,
  is_wanted,
}: StickerCardProps) {
  const [isPending, startTransition] = useTransition()
  
  // Local state for optimistic UI updates
  const [owned, setOwned] = useState(owned_quantity)
  const [wanted, setWanted] = useState(is_wanted)

  const handleIncrement = () => {
    const newVal = owned + 1
    setOwned(newVal)
    startTransition(async () => {
      await updateOwnedQuantity(sticker_id, newVal)
    })
  }

  const handleDecrement = () => {
    if (owned <= 0) return
    // Prevent decrementing below reserved quantity
    if (owned - 1 < reserved_quantity) return

    const newVal = owned - 1
    setOwned(newVal)
    startTransition(async () => {
      await updateOwnedQuantity(sticker_id, newVal)
    })
  }

  const handleToggleWanted = () => {
    const newVal = !wanted
    setWanted(newVal)
    startTransition(async () => {
      await toggleWantedSticker(sticker_id, newVal)
    })
  }

  const available = owned - reserved_quantity

  return (
    <div className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/20 text-primary uppercase tracking-wider">
            {code}
          </span>
          <button 
            onClick={handleToggleWanted}
            className={cn(
              "p-1 rounded-full transition-colors",
              wanted ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
            )}
          >
            <Star className={cn("w-4 h-4", wanted && "fill-current")} />
          </button>
        </div>
        <h3 className="text-sm font-semibold text-foreground truncate">{name}</h3>
        {team && (
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {team} • {group_name}
          </p>
        )}
        
        {reserved_quantity > 0 && (
          <p className="text-[10px] text-destructive mt-1 font-medium">
            {reserved_quantity} reservada{reserved_quantity > 1 ? 's' : ''} em trocas
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 bg-background/50 p-1.5 rounded-xl border border-border/50">
        <button
          onClick={handleDecrement}
          disabled={owned <= 0 || available <= 0 || isPending}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <div className="w-6 text-center">
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
          ) : (
            <span className="font-bold text-foreground text-sm">{owned}</span>
          )}
        </div>

        <button
          onClick={handleIncrement}
          disabled={isPending}
          className="p-1.5 rounded-lg text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
