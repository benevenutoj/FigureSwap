'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonProps {
  referralCode: string
}

export function ShareButton({ referralCode }: ShareButtonProps) {
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://copatroca.com'}/login?ref=${referralCode}`
  const shareText = `Estou usando o CopaTroca para completar meu álbum da Copa! Me cadastrei e já estou encontrando colecionadores perto de mim. Entra aí pelo meu link e ganhamos juntos! 🏆`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CopaTroca — Complete seu álbum!',
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // User dismissed or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
      alert('Link copiado para a área de transferência!')
    }
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="rounded-xl font-bold flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
    >
      <Share2 className="w-4 h-4" />
      Convidar
    </Button>
  )
}
