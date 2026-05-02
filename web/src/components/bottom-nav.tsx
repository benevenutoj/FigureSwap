'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Search, Repeat, User, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Explorar', href: '/explore', icon: Compass },
    { name: 'Meu Álbum', href: '/meu-album', icon: Search },
    { name: 'Trocas', href: '/trades', icon: Repeat },
    { name: 'Loja', href: '/store', icon: Package },
    { name: 'Perfil', href: '/profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 pb-safe">
      <ul className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <li key={item.name} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center h-full w-full space-y-1 text-muted-foreground transition-colors",
                  isActive && "text-primary"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-full transition-all duration-300",
                  isActive ? "bg-primary/10 scale-110" : "hover:bg-accent"
                )}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-all",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {item.name}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
