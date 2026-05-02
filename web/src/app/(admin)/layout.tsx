import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b border-border/50 bg-card/50 backdrop-blur flex items-center gap-4 sticky top-0 z-10">
        <Link href="/" className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold text-lg">Painel Administrativo</h1>
          <p className="text-xs text-muted-foreground">Acesso restrito</p>
        </div>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 pb-20">
        {children}
      </main>
    </div>
  )
}
