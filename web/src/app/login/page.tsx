'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setMessage('Erro ao logar com Google.')
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error(error)
      setMessage(`Erro: ${error.message}`)
    } else {
      setMessage('Link enviado! Verifique seu email.')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

      <main className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 animate-in-fade">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-foreground">
            Figure<span className="text-primary">Swap</span>
          </h1>
          <p className="text-muted-foreground">O maior marketplace de figurinhas.</p>
        </div>

        <div className="space-y-6">
          <Button
            variant="default"
            size="lg"
            className="w-full font-semibold rounded-xl"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Conectando...' : 'Entrar com Google'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/80 px-2 text-muted-foreground rounded-full">
                Ou use seu email
              </span>
            </div>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex h-12 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl"
              type="submit"
              disabled={isLoading || !email}
            >
              Enviar Magic Link
            </Button>
          </form>

          {message && (
            <div className="p-3 text-sm text-center bg-primary/10 text-primary rounded-lg border border-primary/20">
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
