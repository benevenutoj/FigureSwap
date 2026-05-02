import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Compass, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirecionamento inteligente se logado
  if (user) {
    redirect('/explore')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-md mx-auto p-4 flex items-center justify-between z-10">
        <div className="font-black text-2xl text-accent tracking-tighter">
          Copa<span className="text-primary">Troca</span>
        </div>
        <Link href="/login">
          <Button variant="secondary" size="sm" className="font-bold rounded-full bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/30">
            Acessar
          </Button>
        </Link>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto flex flex-col p-6 z-10 pt-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-8 animate-in-fade">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2 border border-primary/20">
            <Zap className="w-4 h-4 fill-current" />
            O motor de match definitivo
          </div>

          <h1 className="text-5xl font-black text-foreground tracking-tight leading-tight">
            A forma mais <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">inteligente</span> de completar seu álbum.
          </h1>
          
          <p className="text-muted-foreground text-lg px-2">
            Cadastre suas figurinhas repetidas, informe as que faltam e deixe nosso algoritmo encontrar a troca perfeita na sua cidade.
          </p>

          <div className="pt-4 flex flex-col gap-3">
            <Link href="/login" className="w-full">
              <Button size="lg" className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                Começar Gratuitamente <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground font-medium">Livre de anúncios. Cancele quando quiser.</p>
          </div>
        </div>

        {/* Features / How it works */}
        <div className="mt-24 w-full text-left space-y-5 animate-in-fade" style={{animationDelay: '100ms'}}>
          <h2 className="text-2xl font-black text-center mb-8">Como funciona?</h2>
          
          <div className="glass-card p-5 rounded-3xl flex items-center gap-5 border border-border/50 hover:bg-accent/50 transition-colors">
            <div className="bg-primary/20 p-4 rounded-2xl text-primary flex-shrink-0">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base mb-1">1. Inventário Digital</h3>
              <p className="text-sm text-muted-foreground leading-snug">Monte seu álbum digital em segundos, marcando o que você tem e o que precisa.</p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl flex items-center gap-5 border border-border/50 hover:bg-accent/50 transition-colors">
            <div className="bg-secondary/20 p-4 rounded-2xl text-secondary flex-shrink-0">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base mb-1">2. Match Automático</h3>
              <p className="text-sm text-muted-foreground leading-snug">O algoritmo cruza os dados com colecionadores da sua região. Adeus às listas confusas!</p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl flex items-center gap-5 border border-border/50 hover:bg-accent/50 transition-colors">
            <div className="bg-green-500/20 p-4 rounded-2xl text-green-500 flex-shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base mb-1">3. Troca Segura</h3>
              <p className="text-sm text-muted-foreground leading-snug">Negocie pelo WhatsApp e avalie a troca após a conclusão para construir reputação.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-sm font-bold text-foreground mb-4">Pronto para trocar?</p>
          <Link href="/login">
            <Button variant="outline" className="rounded-xl h-12 px-8 font-bold border-primary/50 text-primary hover:bg-primary/10">
              Criar minha conta
            </Button>
          </Link>
        </div>

      </main>

      <footer className="p-8 text-center text-xs text-muted-foreground mt-12 z-10 w-full">
        <p>© {new Date().getFullYear()} CopaTroca. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
