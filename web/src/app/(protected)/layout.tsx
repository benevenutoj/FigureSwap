import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/bottom-nav'
import { NotificationBell } from '@/components/notification-bell'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verifica se o perfil está completo
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, state, city, whatsapp')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.name || !profile.state || !profile.city || !profile.whatsapp) {
    redirect('/onboarding')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16">
      <div className="w-full bg-primary text-primary-foreground sticky top-0 z-50 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between px-5 pt-12 pb-4">
          <div className="font-black text-2xl text-accent tracking-tighter">
            Copa<span className="text-primary-foreground">Troca</span>
          </div>
          <NotificationBell userId={user.id} />
        </div>
      </div>
      <main className="flex-1 w-full max-w-md mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
