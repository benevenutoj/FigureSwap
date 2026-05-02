import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: links } = await supabase
    .from('affiliate_links')
    .select('*')
    .order('pack_size', { ascending: true })

  const { count: clicksCount } = await supabase
    .from('link_clicks')
    .select('*', { count: 'exact', head: true })

  async function addLink(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('affiliate_links').insert({
      pack_size: parseInt(formData.get('pack_size') as string),
      label: formData.get('label') as string,
      price_text: formData.get('price_text') as string,
      url: formData.get('url') as string,
    })
    revalidatePath('/admin')
  }

  async function toggleLink(id: string, currentState: boolean) {
    'use server'
    const supabase = await createClient()
    await supabase.from('affiliate_links').update({ is_active: !currentState }).eq('id', id)
    revalidatePath('/admin')
    revalidatePath('/store')
  }

  async function deleteLink(id: string) {
    'use server'
    const supabase = await createClient()
    await supabase.from('affiliate_links').delete().eq('id', id)
    revalidatePath('/admin')
    revalidatePath('/store')
  }

  return (
    <div className="space-y-8 animate-in-fade">
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <h3 className="text-sm font-bold text-muted-foreground uppercase">Packs Cadastrados</h3>
          <p className="text-3xl font-black mt-1 text-primary">{links?.length || 0}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <h3 className="text-sm font-bold text-muted-foreground uppercase">Cliques Totais</h3>
          <p className="text-3xl font-black mt-1 text-secondary">{clicksCount || 0}</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-lg font-bold mb-4 text-foreground">Adicionar Novo Pack</h2>
        <form action={addLink} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="pack_size" type="number" placeholder="Tamanho (ex: 21)" required />
          <Input name="label" placeholder="Título (ex: 21 Figurinhas)" required />
          <Input name="price_text" placeholder="Preço (ex: A partir de R$ 14,90)" required />
          <Input name="url" type="url" placeholder="URL do Mercado Livre" required />
          <Button type="submit" className="md:col-span-2 rounded-xl h-11 font-bold">Salvar Link</Button>
        </form>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-lg font-bold mb-4 text-foreground">Packs de Afiliado</h2>
        <div className="space-y-3">
          {links?.map(link => (
            <div key={link.id} className="p-4 border border-border/50 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-background/50">
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-foreground">
                  {link.label} <span className="text-muted-foreground font-normal text-sm">({link.pack_size} un.)</span>
                </h4>
                <p className="text-sm text-primary font-medium">{link.price_text}</p>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block mt-1">
                  {link.url}
                </a>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <form action={toggleLink.bind(null, link.id, link.is_active)} className="flex-1 md:flex-none">
                  <Button variant={link.is_active ? 'outline' : 'secondary'} size="sm" className="w-full rounded-lg">
                    {link.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                </form>
                <form action={deleteLink.bind(null, link.id)} className="flex-1 md:flex-none">
                  <Button variant="destructive" size="sm" className="w-full rounded-lg">Excluir</Button>
                </form>
              </div>
            </div>
          ))}
          {links?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum link cadastrado.</p>}
        </div>
      </div>
    </div>
  )
}
