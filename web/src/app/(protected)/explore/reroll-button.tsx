'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Coins } from 'lucide-react'
import { rerollMatches } from './actions'

export function RerollButton({ credits }: { credits: number }) {
  const [loading, setLoading] = useState(false)

  async function handleReroll() {
    setLoading(true)
    const res = await rerollMatches()
    if (res?.error) {
      alert(res.error)
    }
    // Artificial delay for the "shuffling" effect
    setTimeout(() => {
      setLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 800)
  }

  return (
    <Button 
      onClick={handleReroll}
      disabled={loading || credits < 1}
      className="w-full font-bold h-12 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
    >
      <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
      Re-roll Matches
      <span className="bg-background/20 px-2 py-0.5 rounded text-xs ml-2 flex items-center gap-1">
        Custo: 1 <Coins className="w-3 h-3" />
      </span>
    </Button>
  )
}
