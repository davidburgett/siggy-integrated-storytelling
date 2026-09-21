'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { Tags, Hash } from 'lucide-react'

interface TagInfo { tag: string; count: number; stories: string[] }

export function TagsClient() {
  const [tags, setTags] = useState<TagInfo[]>([])

  const load = useCallback(async () => {
    const res = await fetch('/api/tags')
    if (res.ok) setTags(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Tag Browser</h1>
          <p className="text-muted-foreground mt-1">All semantic tags across your stories.</p>
        </div>
      </FadeIn>

      {(tags?.length ?? 0) === 0 ? (
        <FadeIn>
          <Card className="text-center py-12">
            <CardContent>
              <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tags found. Add tags to parts in the editor.</p>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.03}>
          {tags.map((t) => (
            <StaggerItem key={t.tag}>
              <Card>
                <CardContent className="flex items-center gap-3 py-4">
                  <Hash className="h-5 w-5 text-accent" />
                  <div className="flex-1">
                    <span className="font-mono font-medium">{t.tag}</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {(t?.stories ?? []).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono">{t.count}</Badge>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
