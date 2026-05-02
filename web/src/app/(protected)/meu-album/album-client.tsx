'use client'

import { useState, useMemo } from 'react'
import { StickerCard } from '@/components/sticker-card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface StickerData {
  id: string
  sticker_id: string
  code: string
  name: string
  team: string
  group_name: string
  owned_quantity: number
  reserved_quantity: number
  is_wanted: boolean
}

interface AlbumClientProps {
  stickers: StickerData[]
}

export function AlbumClient({ stickers }: AlbumClientProps) {
  const [query, setQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')

  const groups = useMemo(() => Array.from(new Set(stickers.map(s => s.group_name))).filter(Boolean).sort(), [stickers])
  
  // Teams available based on selected group, or all teams
  const teams = useMemo(() => {
    let filtered = stickers
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(s => s.group_name === selectedGroup)
    }
    return Array.from(new Set(filtered.map(s => s.team))).filter(Boolean).sort()
  }, [stickers, selectedGroup])

  const filteredData = useMemo(() => {
    let res = stickers
    if (query) {
      const q = query.toLowerCase()
      res = res.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
    }
    if (selectedGroup !== 'all') {
      res = res.filter(s => s.group_name === selectedGroup)
    }
    if (selectedTeam !== 'all') {
      res = res.filter(s => s.team === selectedTeam)
    }
    
    switch (activeTab) {
      case 'owned':      return res.filter(s => s.owned_quantity === 1)   // Possuídas: exatamente 1
      case 'repeated':   return res.filter(s => s.owned_quantity > 1)     // Repetidas: mais de 1
      case 'missing':    return res.filter(s => s.owned_quantity === 0)   // Faltantes: nenhuma
      case 'wanted':     return res.filter(s => s.is_wanted)              // Desejadas: marcadas como quero
      default:           return res                                         // Todas
    }
  }, [stickers, query, selectedGroup, selectedTeam, activeTab])

  // Completude Metrics
  const totalStickers = stickers.length
  const uniqueOwned = stickers.filter(s => s.owned_quantity > 0).length
  const percentage = totalStickers === 0 ? 0 : Math.round((uniqueOwned / totalStickers) * 100)

  let contextualMetrics = null
  if (selectedTeam !== 'all') {
    const teamStickers = stickers.filter(s => s.team === selectedTeam)
    const teamOwned = teamStickers.filter(s => s.owned_quantity > 0).length
    const teamPct = teamStickers.length === 0 ? 0 : Math.round((teamOwned / teamStickers.length) * 100)
    contextualMetrics = { label: selectedTeam, owned: teamOwned, total: teamStickers.length, pct: teamPct }
  } else if (selectedGroup !== 'all') {
    const groupStickers = stickers.filter(s => s.group_name === selectedGroup)
    const groupOwned = groupStickers.filter(s => s.owned_quantity > 0).length
    const groupPct = groupStickers.length === 0 ? 0 : Math.round((groupOwned / groupStickers.length) * 100)
    contextualMetrics = { label: selectedGroup, owned: groupOwned, total: groupStickers.length, pct: groupPct }
  }

  return (
    <div className="space-y-6">
      {/* Indicadores de Progresso */}
      <div className="flex gap-4 w-full">
        <div className="flex-1 bg-background/50 rounded-2xl p-4 border border-border/50 glass-card">
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Meu Álbum</p>
          <p className="text-xl font-black text-primary">
            {uniqueOwned} <span className="text-sm text-muted-foreground font-medium">/ {totalStickers}</span>
          </p>
          <div className="w-full bg-secondary/20 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${percentage}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">{percentage}% completo</p>
        </div>
        
        {contextualMetrics && (
          <div className="flex-1 bg-background/50 rounded-2xl p-4 border border-border/50 glass-card animate-in-fade">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 truncate">{contextualMetrics.label}</p>
            <p className="text-xl font-black text-foreground">
              {contextualMetrics.owned} <span className="text-sm text-muted-foreground font-medium">/ {contextualMetrics.total}</span>
            </p>
            <div className="w-full bg-secondary/20 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-foreground h-full rounded-full transition-all" 
                style={{ width: `${contextualMetrics.pct}%` }} 
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">{contextualMetrics.pct}% completo</p>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="space-y-3 glass-card p-4 rounded-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por jogador ou código..."
            className="pl-9 h-11 bg-background/50 rounded-xl border-border/50 text-sm"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <select 
            value={selectedGroup} 
            onChange={(e) => {
              setSelectedGroup(e.target.value)
              setSelectedTeam('all') // Reset team when group changes
            }}
            className="flex h-11 w-full items-center justify-between rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="all">Todos os Grupos</option>
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select 
            value={selectedTeam} 
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="flex h-11 w-full items-center justify-between rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
          >
            <option value="all">Todas as Seleções</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs de status */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-11 rounded-xl bg-background/50 glass-card border border-border/50 mb-4">
          <TabsTrigger value="all" className="rounded-lg text-[10px] font-bold">Todas</TabsTrigger>
          <TabsTrigger value="owned" className="rounded-lg text-[10px] font-bold">1x</TabsTrigger>
          <TabsTrigger value="repeated" className="rounded-lg text-[10px] font-bold">Repetidas</TabsTrigger>
          <TabsTrigger value="missing" className="rounded-lg text-[10px] font-bold">Faltantes</TabsTrigger>
          <TabsTrigger value="wanted" className="rounded-lg text-[10px] font-bold">Desejadas</TabsTrigger>
        </TabsList>

        <div className="space-y-3">
          {filteredData.length === 0 ? (
            <div className="text-center py-10 glass-card rounded-2xl">
              <p className="text-muted-foreground">Nenhuma figurinha encontrada com estes filtros.</p>
            </div>
          ) : (
            filteredData.map(s => <StickerCard key={s.sticker_id} {...s} />)
          )}
        </div>
      </Tabs>
    </div>
  )
}
