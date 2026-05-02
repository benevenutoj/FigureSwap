'use client'

import { useState, useTransition } from 'react'
import { createTradeProposal } from '../actions'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StickerInfo {
  id: string
  code: string
  name: string
}

interface UserInfo {
  id: string
  name: string
  city: string
  state: string
}

interface CustomTradeClientProps {
  currentUserId: string
  targetUser: UserInfo
  targetSticker?: StickerInfo // Se for via busca
  myRepeatedStickers: StickerInfo[]
  // Caso de Match Perfeito
  theyGive?: StickerInfo[]
  theyWant?: StickerInfo[]
  isPerfectMatch: boolean
}

export function CustomTradeClient({
  currentUserId,
  targetUser,
  targetSticker,
  myRepeatedStickers,
  theyGive,
  theyWant,
  isPerfectMatch
}: CustomTradeClientProps) {
  const [selectedStickers, setSelectedStickers] = useState<Set<string>>(
    new Set(isPerfectMatch && theyWant ? theyWant.map(s => s.id) : [])
  )
  const [isPending, startTransition] = useTransition()

  const toggleSticker = (id: string) => {
    if (isPerfectMatch) return // Não pode alterar match perfeito
    
    const newSet = new Set(selectedStickers)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedStickers(newSet)
  }

  const handleSubmit = () => {
    if (!isPerfectMatch && selectedStickers.size === 0) {
      alert("Selecione pelo menos uma figurinha para oferecer em troca.")
      return
    }

    startTransition(async () => {
      const items = []

      if (isPerfectMatch) {
        // Match perfeito já tem a lista exata
        theyGive?.forEach(s => items.push({ sender_id: targetUser.id, sticker_id: s.id, quantity: 1 }))
        theyWant?.forEach(s => items.push({ sender_id: currentUserId, sticker_id: s.id, quantity: 1 }))
      } else {
        // Busca customizada
        if (targetSticker) {
          items.push({ sender_id: targetUser.id, sticker_id: targetSticker.id, quantity: 1 })
        }
        selectedStickers.forEach(id => {
          items.push({ sender_id: currentUserId, sticker_id: id, quantity: 1 })
        })
      }

      try {
        await createTradeProposal(targetUser.id, items)
      } catch (err: any) {
        alert(err.message || "Erro ao enviar proposta.")
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* O que você recebe */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="text-sm font-bold uppercase text-secondary mb-4 flex items-center justify-between">
          <span>Você quer de {targetUser.name.split(' ')[0]}</span>
          <span className="text-[10px] text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full lowercase font-medium">
            O que você recebe
          </span>
        </h3>
        <ul className="space-y-3">
          {isPerfectMatch ? (
            theyGive?.map(s => (
              <li key={s.id} className="flex items-center gap-3 text-sm p-2 rounded-xl bg-secondary/5 border border-secondary/10">
                <span className="bg-secondary/20 text-secondary px-2.5 py-1 rounded-lg text-xs font-black min-w-[3rem] text-center">{s.code}</span>
                <span className="font-medium text-foreground">{s.name}</span>
              </li>
            ))
          ) : targetSticker ? (
            <li className="flex items-center gap-3 text-sm p-2 rounded-xl bg-secondary/5 border border-secondary/10">
              <span className="bg-secondary/20 text-secondary px-2.5 py-1 rounded-lg text-xs font-black min-w-[3rem] text-center">{targetSticker.code}</span>
              <span className="font-medium text-foreground">{targetSticker.name}</span>
            </li>
          ) : (
             <p className="text-muted-foreground text-sm italic">Nenhuma figurinha especificada.</p>
          )}
        </ul>
      </div>

      {/* O que você envia */}
      <div className="glass-card rounded-3xl p-6">
        <div className="mb-4">
          <h3 className="text-sm font-bold uppercase text-primary flex items-center justify-between">
            <span>Você envia em troca</span>
            <span className="text-[10px] text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full lowercase font-medium">
              O que você dá
            </span>
          </h3>
          {!isPerfectMatch && (
            <p className="text-xs text-muted-foreground mt-2">
              Selecione quais das suas repetidas você quer oferecer para {targetUser.name.split(' ')[0]}.
            </p>
          )}
        </div>

        {isPerfectMatch ? (
          <ul className="space-y-3">
            {theyWant?.map(s => (
              <li key={s.id} className="flex items-center gap-3 text-sm p-2 rounded-xl bg-primary/5 border border-primary/10">
                <span className="bg-primary/20 text-primary px-2.5 py-1 rounded-lg text-xs font-black min-w-[3rem] text-center">{s.code}</span>
                <span className="font-medium text-foreground">{s.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {myRepeatedStickers.length === 0 ? (
              <div className="text-center p-4 bg-muted/20 rounded-xl">
                <p className="text-sm text-muted-foreground">Você não tem figurinhas repetidas no momento.</p>
              </div>
            ) : (
              myRepeatedStickers.map(s => {
                const isSelected = selectedStickers.has(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSticker(s.id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl transition-all border text-left",
                      isSelected 
                        ? "bg-primary/10 border-primary/30 shadow-sm" 
                        : "bg-background/50 border-border/50 hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-xs font-black min-w-[3rem] text-center transition-colors",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {s.code}
                      </span>
                      <span className={cn(
                        "font-medium text-sm transition-colors",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {s.name}
                      </span>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
                      isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                    )}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={isPending || (!isPerfectMatch && selectedStickers.size === 0) || (myRepeatedStickers.length === 0 && !isPerfectMatch)}
        size="lg" 
        className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
      >
        {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirmar e Enviar Proposta"}
      </Button>
    </div>
  )
}
