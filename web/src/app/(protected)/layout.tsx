import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/bottom-nav'

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
      <main className="flex-1 w-full max-w-md mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
