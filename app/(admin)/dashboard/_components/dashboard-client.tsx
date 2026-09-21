'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, FileText, Eye, Users, Key } from 'lucide-react'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'

interface Props {
  stats: { stories: number; parts: number; published: number; readers: number; apiKeys: number }
}

export function DashboardClient({ stats }: Props) {
  const items = [
    { label: 'Stories', value: stats?.stories ?? 0, icon: BookOpen, color: 'text-primary' },
    { label: 'Total Parts', value: stats?.parts ?? 0, icon: FileText, color: 'text-blue-500' },
    { label: 'Published', value: stats?.published ?? 0, icon: Eye, color: 'text-green-500' },
    { label: 'Readers', value: stats?.readers ?? 0, icon: Users, color: 'text-amber-500' },
    { label: 'API Keys', value: stats?.apiKeys ?? 0, icon: Key, color: 'text-purple-500' },
  ]

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your storytelling framework.</p>
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" staggerDelay={0.05}>
        {items.map((item) => (
          <StaggerItem key={item.label}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{item.value}</div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}
