import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createTradeProposal } from '../actions'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function NewTradePage({
  searchParams
}: {
  searchParams: Promise<{ match_id?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { match_id } = await searchParams

  if (!user || !match_id) {
    redirect('/explore')
  }

  // Fetch match details again to ensure consistency
  const { data: matches } = await supabase.rpc('get_user_matches', {
    p_user_id: user.id
  })

  const match = matches?.find((m: any) => m.match_user_id === match_id)

  if (!match) {
    return (
      <div className="p-4 pt-10 text-center">
        <h1 className="text-xl font-bold mb-2">Match não encontrado</h1>
        <p className="text-muted-foreground">O usuário pode não ter mais as figurinhas disponíveis.</p>
      </div>
    )
  }

  // Form action
  async function submitProposal() {
    'use server'
    if (!user) return

    const items = []
    
    // I am sending what they want
    if (match.they_want) {
      for (const s of match.they_want) {
        items.push({
          sender_id: user.id,
          sticker_id: s.id,
          quantity: 1
        })
      }
    }

    // They are sending what they give (what I want)
    if (match.they_give) {
      for (const s of match.they_give) {
        items.push({
          sender_id: match.match_user_id,
          sticker_id: s.id,
          quantity: 1
        })
      }
    }

    await createTradeProposal(match.match_user_id, items)
  }

  return (
    <div className="p-4 pb-24 min-h-screen">
      <header className="pt-2 mb-8">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Propor Troca
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Confirme os detalhes da proposta para {match.match_user_name}.
        </p>
      </header>

      <div className="glass-card rounded-3xl p-6 mb-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase text-secondary mb-3">Você Recebe</h3>
            <ul className="space-y-2">
              {match.they_give?.map((s: any) => (
                <li key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded text-xs font-bold">{s.code}</span>
                  <span>{s.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-border/50" />

          <div>
            <h3 className="text-sm font-bold uppercase text-primary mb-3">Você Envia</h3>
            <ul className="space-y-2">
              {match.they_want?.map((s: any) => (
                <li key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold">{s.code}</span>
                  <span>{s.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <form action={submitProposal}>
        <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
          Confirmar e Enviar Proposta
        </Button>
      </form>
    </div>
  )
}
