import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bell, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Mark all as read upon opening the page
  if (notifications && notifications.some(n => !n.is_read)) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
  }

  return (
    <div className="p-4 pb-24 min-h-screen">
      <header className="pt-2 mb-6 flex items-center gap-4">
        <Link href="/" className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Notificações</h1>
        </div>
      </header>

      <div className="space-y-3">
        {(!notifications || notifications.length === 0) && (
          <div className="text-center py-12 glass-card rounded-3xl animate-in-fade">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Você não tem notificações.</p>
          </div>
        )}

        {notifications?.map((notif: any) => (
          <Link key={notif.id} href={notif.link || '#'} className={cn(
            "glass-card p-4 rounded-xl flex items-center justify-between gap-4 transition-all hover:bg-accent group animate-in-fade",
            !notif.is_read ? "border-primary/50 bg-primary/5" : "opacity-80"
          )}>
            <div>
              <p className="text-sm font-medium text-foreground">{notif.content}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(notif.created_at).toLocaleDateString('pt-BR')} às {new Date(notif.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {notif.link && <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />}
          </Link>
        ))}
      </div>
    </div>
  )
}
