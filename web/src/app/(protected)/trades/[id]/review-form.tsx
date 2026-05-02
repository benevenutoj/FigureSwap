'use client'

import { useState, useTransition } from 'react'
import { submitReview } from '../actions'
import { Button } from '@/components/ui/button'
import { Star, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  tradeId: string
  revieweeId: string
  revieweeName: string
}

export function ReviewForm({ tradeId, revieweeId, revieweeName }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Selecione de 1 a 5 estrelas.')
      return
    }

    startTransition(async () => {
      try {
        await submitReview(tradeId, revieweeId, rating, comment)
      } catch (err: any) {
        setError(err.message || 'Erro ao enviar avaliação.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-4 border border-border/50 bg-background/50 animate-in-fade space-y-4">
      <h3 className="text-sm font-bold text-foreground">Como foi a troca com {revieweeName}?</h3>
      
      <div className="flex justify-center gap-2 py-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 transition-transform hover:scale-110"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          >
            <Star 
              className={cn(
                "w-8 h-8 transition-colors",
                (hoverRating || rating) >= star 
                  ? "fill-yellow-500 text-yellow-500" 
                  : "text-muted-foreground/30"
              )} 
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Deixe um comentário curto (opcional)..."
        className="w-full bg-background/50 rounded-xl border border-border/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20"
      />

      {error && <p className="text-xs text-destructive font-medium">{error}</p>}

      <Button type="submit" disabled={isPending || rating === 0} className="w-full font-bold">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Avaliação'}
      </Button>
    </form>
  )
}
