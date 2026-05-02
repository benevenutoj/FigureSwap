import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon, Star, MapPin, Phone, Coins, Gift } from 'lucide-react'
import { CopyButton } from './copy-button'
import { ShareButton } from './share-button'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  // Get reviews received
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(name)')
    .eq('reviewee_id', user.id)
    .order('created_at', { ascending: false })

  async function handleLogout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="p-4 pb-24 min-h-screen">
      <header className="pt-2 mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          Meu Perfil
        </h1>
      </header>

      <div className="glass-card rounded-3xl p-6 mb-8 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <UserIcon className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
        <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
          <MapPin className="w-4 h-4" /> {profile.city}, {profile.state}
        </p>

        <div className="flex gap-2 mt-6 w-full">
          <div className="flex-1 bg-background/50 rounded-2xl p-3 border border-border/50">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Reputação</p>
            <p className="text-lg font-black text-yellow-500 flex items-center justify-center gap-1">
              {profile.rating_avg > 0 ? profile.rating_avg.toFixed(1) : 'Novo'} <Star className="w-4 h-4 fill-current" />
            </p>
            {profile.review_count > 0 && (
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{profile.review_count} avaliações</p>
            )}
          </div>
          <div className="flex-1 bg-background/50 rounded-2xl p-3 border border-border/50">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Créditos</p>
            <p className="text-lg font-black text-blue-500 flex items-center justify-center gap-1">
              {profile.credits} <Coins className="w-4 h-4" />
            </p>
          </div>
          <div className="flex-1 bg-background/50 rounded-2xl p-3 border border-border/50">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Status</p>
            <p className="text-sm font-bold text-primary mt-1">
              {profile.is_premium ? 'Premium' : 'Free'}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 mb-8 text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <Gift className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-bold text-foreground mb-1">Convide e Ganhe</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Ganhe <strong className="text-primary">+2 créditos</strong> por cada amigo que se cadastrar pelo seu link e preencher o deck inicial.
        </p>
        <div className="bg-background border border-border rounded-xl p-3 flex items-center justify-between gap-2">
          <span className="text-sm font-mono text-foreground font-medium truncate flex-1 text-left select-all">
            {profile.referral_code}
          </span>
          <div className="flex items-center gap-2">
            <CopyButton code={profile.referral_code} />
            <ShareButton referralCode={profile.referral_code} />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">WhatsApp</p>
            <p className="text-sm font-medium text-foreground">{profile.whatsapp}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">E-mail de acesso</p>
            <p className="text-sm font-medium text-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      {reviews && reviews.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-foreground mb-3 px-2">Avaliações Recebidas</h3>
          <div className="space-y-3">
            {reviews.map((rev: any, index: number) => (
              <div key={index} className="glass-card rounded-2xl p-4 border border-border/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-foreground">{rev.reviewer.name}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3 h-3 ${rev.rating >= s ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                </div>
                {rev.comment && <p className="text-sm text-muted-foreground italic">"{rev.comment}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <form action={handleLogout}>
        <Button 
          type="submit" 
          variant="destructive" 
          size="lg" 
          className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-destructive/40 flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </Button>
      </form>
    </div>
  )
}
