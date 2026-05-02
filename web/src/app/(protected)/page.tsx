export default function HomePage() {
  return (
    <div className="p-6 space-y-6 animate-in-fade">
      <header className="pt-4">
        <h1 className="text-2xl font-bold text-foreground">Início</h1>
        <p className="text-muted-foreground text-sm">Resumo do seu marketplace.</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-primary">0</span>
          <span className="text-xs text-muted-foreground uppercase font-semibold mt-1">Repetidas</span>
        </div>
        <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-secondary">0</span>
          <span className="text-xs text-muted-foreground uppercase font-semibold mt-1">Faltantes</span>
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold border-b border-border/50 pb-2">Propostas Pendentes</h2>
        <div className="glass-card p-6 rounded-2xl text-center">
          <p className="text-sm text-muted-foreground">Nenhuma proposta pendente no momento.</p>
        </div>
      </section>
    </div>
  )
}
