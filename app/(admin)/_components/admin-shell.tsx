'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  BookOpen, LayoutDashboard, Tags, Key, Users, FileText,
  PanelLeft, LogOut, ChevronRight
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Stories', href: '/stories', icon: BookOpen },
  { label: 'Tags', href: '/tags', icon: Tags },
  { label: 'API Keys', href: '/api-keys', icon: Key },
  { label: 'Readers', href: '/readers', icon: Users },
  { label: 'API Docs', href: '/docs', icon: FileText },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card transition-transform duration-300 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-display font-bold tracking-tight">SIS Framework</span>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {active && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-border p-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={() => signOut({ redirectTo: '/login' })}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="ml-auto" />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
