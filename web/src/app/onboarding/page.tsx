'use client'

import { Button } from '@/components/ui/button'
import { completeProfile } from './actions'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setErrorMsg('')
    try {
      await completeProfile(formData)
    } catch (error: any) {
      setErrorMsg(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
      
      <main className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 animate-in-fade">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground">
            Complete seu Perfil
          </h1>
          <p className="text-sm text-muted-foreground">
            Precisamos de mais alguns detalhes para você começar a trocar figurinhas.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">Nome Completo</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="flex h-12 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Ex: João Silva"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-medium text-foreground">Estado</label>
              <select
                id="state"
                name="state"
                required
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">UF</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium text-foreground">Cidade</label>
              <input
                id="city"
                name="city"
                type="text"
                required
                className="flex h-12 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Sua cidade"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="whatsapp" className="text-sm font-medium text-foreground">WhatsApp</label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              required
              className="flex h-12 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="(11) 99999-9999"
            />
            <p className="text-xs text-muted-foreground">Usado apenas para contato após fechar uma troca.</p>
          </div>

          {errorMsg && (
            <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-center">
              {errorMsg}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-xl mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              'Finalizar e Entrar'
            )}
          </Button>
        </form>
      </main>
    </div>
  )
}
