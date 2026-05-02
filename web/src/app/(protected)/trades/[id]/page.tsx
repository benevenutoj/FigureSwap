import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateStatus } from '../actions'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, CheckCircle2, MessageCircle, Star } from 'lucide-react'
import Link from 'next/link'
import { ReviewForm } from './review-form'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function TradeDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { id } = await params

  if (!user) redirect('/login')

  const { data: trade } = await supabase
    .from('trades')
    .select(`
      *,
      proposer:profiles!trades_proposer_id_fkey(*),
      receiver:profiles!trades_receiver_id_fkey(*),
      items:trade_items(
        *,
        sticker:stickers(*)
      )
    `)
    .eq('id', id)
    .single()

  if (!trade || (trade.proposer_id !== user.id && trade.receiver_id !== user.id)) {
    return <div className="p-4 pt-10 text-center">Troca não encontrada ou acesso negado.</div>
  }

  const isProposer = trade.proposer_id === user.id
  const otherUser = isProposer ? trade.receiver : trade.proposer
  const status = trade.status

  let hasReviewed = false
  let givenReview = null
  if (status === 'completed') {
    const { data: review } = await supabase
      .from('reviews')
      .select('*')
      .eq('trade_id', trade.id)
      .eq('reviewer_id', user.id)
      .maybeSingle()
    if (review) {
      hasReviewed = true
      givenReview = review
    }
  }

  const myItems = trade.items.filter((i: any) => i.sender_id === user.id)
  const theirItems = trade.items.filter((i: any) => i.sender_id === otherUser.id)

  const myItemsText = myItems.map((i: any) => i.sticker.code).join(', ')
  const theirItemsText = theirItems.map((i: any) => i.sticker.code).join(', ')
  const wpText = `Olá ${otherUser.name}, viemos do CopaTroca para combinarmos nossa troca!\nVou te passar: ${myItemsText || 'Nada'}.\nVocê me passa: ${theirItemsText || 'Nada'}.`
  const wpUrl = `https://wa.me/55${otherUser.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(wpText)}`

  async function handleAction(formData: FormData) {
    'use server'
    const newStatus = formData.get('status') as string
    await updateStatus(trade.id, newStatus)
  }

  return (
    <div className="p-4 pb-24 min-h-screen">
      <header className="pt-2 mb-6 flex items-center gap-4">
        <Link href="/trades" className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Detalhes da Troca</h1>
          <p className="text-xs text-muted-foreground">Com {otherUser.name}</p>
        </div>
      </header>

      {/* Status Banner */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-3">
        {status === 'completed' ? (
          <CheckCircle2 className="w-8 h-8 text-secondary" />
        ) : (
          <Clock className="w-8 h-8 text-primary" />
        )}
        <div>
          <h2 className="font-bold text-foreground tracking-wide text-sm">
            {status === 'pending' && 'Proposta Enviada'}
            {status === 'accepted' && 'Aceita'}
            {status === 'scheduled' && 'Agendada'}
            {status === 'awaiting_confirmation' && 'Aguardando Confirmação'}
            {status === 'completed' && 'Concluída'}
            {status === 'cancelled' && 'Cancelada'}
            {status === 'rejected' && 'Recusada'}
            {status === 'expired' && 'Expirada'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {status === 'pending' && 'Aguardando aceite da proposta.'}
            {status === 'accepted' && 'Proposta aceita! Combinem pelo WhatsApp.'}
            {status === 'scheduled' && 'Encontro agendado. Figurinhas reservadas.'}
            {status === 'awaiting_confirmation' && 'Aguardando a confirmação final da troca.'}
            {status === 'completed' && 'Troca finalizada com sucesso!'}
            {['cancelled', 'rejected', 'expired'].includes(status) && 'Esta negociação foi encerrada.'}
          </p>
        </div>
      </div>

      {/* Itens */}
      <div className="space-y-4 mb-8">
        <div className="glass-card rounded-2xl p-4 bg-secondary/5 border-secondary/20">
          <h3 className="text-xs font-bold uppercase text-secondary mb-3">Você Recebe</h3>
          <div className="space-y-2">
            {theirItems.map((item: any) => (
              <div key={item.id} className="text-sm font-medium">
                <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded text-xs font-bold mr-2">{item.sticker.code}</span>
                {item.sticker.name}
              </div>
            ))}
            {theirItems.length === 0 && <p className="text-xs text-muted-foreground">Nada</p>}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 bg-primary/5 border-primary/20">
          <h3 className="text-xs font-bold uppercase text-primary mb-3">Você Envia</h3>
          <div className="space-y-2">
            {myItems.map((item: any) => (
              <div key={item.id} className="text-sm font-medium">
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold mr-2">{item.sticker.code}</span>
                {item.sticker.name}
              </div>
            ))}
            {myItems.length === 0 && <p className="text-xs text-muted-foreground">Nada</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <form action={handleAction} className="space-y-3">
        {status === 'pending' && !isProposer && (
          <div className="grid grid-cols-2 gap-3">
            <Button type="submit" name="status" value="accepted" className="w-full font-bold">Aceitar Proposta</Button>
            <Button type="submit" name="status" value="rejected" variant="destructive" className="w-full font-bold">Rejeitar</Button>
          </div>
        )}

        {status === 'pending' && isProposer && (
          <Button type="submit" name="status" value="cancelled" variant="destructive" className="w-full font-bold">Cancelar Proposta</Button>
        )}

        {status === 'accepted' && (
          <>
            <a 
              href={wpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 h-10 rounded-md bg-green-500 hover:bg-green-600 text-white font-bold transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> Combinar via WhatsApp
            </a>
            <div className="text-center my-4 text-xs text-muted-foreground">
              Após combinar o local, agende a troca para reservar as figurinhas.
            </div>
            <Button type="submit" name="status" value="scheduled" className="w-full font-bold">Marcar como Agendada</Button>
            <Button type="submit" name="status" value="cancelled" variant="ghost" className="w-full text-destructive">Cancelar Troca</Button>
          </>
        )}

        {status === 'scheduled' && (
          <>
            <Button type="submit" name="status" value="awaiting_confirmation" className="w-full font-bold">Já realizamos a troca</Button>
            <Button type="submit" name="status" value="cancelled" variant="ghost" className="w-full text-destructive">Desmarcar / Cancelar</Button>
          </>
        )}

        {status === 'awaiting_confirmation' && (
          <>
            <p className="text-xs text-center text-muted-foreground mb-4">A outra parte marcou a troca como realizada. Confirme se você já recebeu suas figurinhas para finalizarmos.</p>
            <Button type="submit" name="status" value="completed" className="w-full font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground">
              Confirmar Recebimento (Finalizar)
            </Button>
          </>
        )}
      </form>

      {/* Review Section */}
      {status === 'completed' && !hasReviewed && (
        <div className="mt-8">
          <ReviewForm tradeId={trade.id} revieweeId={otherUser.id} revieweeName={otherUser.name} />
        </div>
      )}

      {status === 'completed' && hasReviewed && givenReview && (
        <div className="mt-8 glass-card rounded-2xl p-4 border border-border/50 bg-background/50">
          <h3 className="text-sm font-bold text-foreground mb-2">Sua Avaliação</h3>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className={cn("w-4 h-4", givenReview.rating >= star ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30")} />
            ))}
          </div>
          {givenReview.comment && (
            <p className="text-sm text-muted-foreground italic">"{givenReview.comment}"</p>
          )}
        </div>
      )}
    </div>
  )
}
