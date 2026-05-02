'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/?ref=${code}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <Button 
      variant="secondary" 
      size="sm" 
      onClick={handleCopy}
      className="h-8 px-3 rounded-lg flex items-center gap-2"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      <span className="text-xs">{copied ? 'Copiado!' : 'Copiar Link'}</span>
    </Button>
  )
}
