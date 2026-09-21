'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { Users, BookOpen } from 'lucide-react'
import { SafeDate } from '@/components/safe-format'

interface ReaderItem {
  id: string; externalId: string; label: string | null; createdAt: string
  story: { title: string } | null
  state: { currentPart: { title: string } | null } | null
  _count: { history: number }
}

export function ReadersClient() {
  const [readers, setReaders] = useState<ReaderItem[]>([])

  const load = useCallback(async () => {
    const res = await fetch('/api/readers')
    if (res.ok) setReaders(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Reader Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track reader progress across your stories.</p>
        </div>
      </FadeIn>

      {(readers?.length ?? 0) === 0 ? (
        <FadeIn>
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No readers yet. Readers are created via the API.</p>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <Stagger className="space-y-2" staggerDelay={0.03}>
          {readers.map((r) => (
            <StaggerItem key={r.id}>
              <Card>
                <CardContent className="flex items-center gap-4 py-3">
                  <Users className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{r.externalId}</span>
                      {r.label && <Badge variant="secondary">{r.label}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Story: {r?.story?.title ?? 'Unknown'} · Parts read: {r?._count?.history ?? 0}
                      {r?.state?.currentPart && <> · At: {r.state.currentPart.title}</>}
                    </p>
                  </div>
                  <SafeDate date={r.createdAt} options={{ dateStyle: 'short' }} className="text-xs text-muted-foreground" />
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
