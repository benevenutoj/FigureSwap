import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowRightLeft, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const dynamic = 'force-dynamic'

export default async function TradesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch all trades involving the user
  const { data: trades } = await supabase
    .from('trades')
    .select(`
      id,
      status,
      created_at,
      expires_at,
      proposer_id,
      receiver_id,
      proposer:profiles!trades_proposer_id_fkey(name),
      receiver:profiles!trades_receiver_id_fkey(name)
    `)
    .or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  const activeStatuses = ['pending', 'accepted', 'scheduled', 'awaiting_confirmation']
  const activeTrades = trades?.filter(t => activeStatuses.includes(t.status)) || []
  const historyTrades = trades?.filter(t => !activeStatuses.includes(t.status)) || []

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'pending': return { label: 'Pendente', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
      case 'accepted': return { label: 'Aceita', icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10' }
      case 'scheduled': return { label: 'Agendada', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' }
      case 'awaiting_confirmation': return { label: 'Aguardando Conf.', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' }
      case 'completed': return { label: 'Concluída', icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10' }
      case 'cancelled': 
      case 'rejected': 
      case 'expired': return { label: 'Cancelada/Rejeitada', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' }
      default: return { label: status, icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' }
    }
  }

  const TradeCard = ({ trade }: { trade: any }) => {
    const isProposer = trade.proposer_id === user.id
    const otherUserName = isProposer ? trade.receiver?.name : trade.proposer?.name
    const statusInfo = getStatusInfo(trade.status)
    const StatusIcon = statusInfo.icon

    return (
      <Link href={`/trades/${trade.id}`} className="block">
        <div className="glass-card rounded-2xl p-4 transition-all hover:bg-accent/50 active:scale-[0.98]">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {isProposer ? 'Você propôs para' : 'Proposta de'}
              </p>
              <h3 className="font-bold text-foreground text-lg">{otherUserName}</h3>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wide">{statusInfo.label}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
            <span>{new Date(trade.created_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-1 text-primary">
              Ver Detalhes <ArrowRightLeft className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="p-4 pb-24 min-h-screen">
      <header className="pt-2 mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          Trocas
          <ArrowRightLeft className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acompanhe suas negociações em andamento e histórico.
        </p>
      </header>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-background/50 glass-card border border-border/50 mb-6">
          <TabsTrigger value="active" className="rounded-lg">Ativas ({activeTrades.length})</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg">Histórico ({historyTrades.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeTrades.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma troca ativa no momento.</p>
            </div>
          ) : (
            activeTrades.map(trade => <TradeCard key={trade.id} trade={trade} />)
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {historyTrades.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum histórico de trocas.</p>
            </div>
          ) : (
            historyTrades.map(trade => <TradeCard key={trade.id} trade={trade} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
