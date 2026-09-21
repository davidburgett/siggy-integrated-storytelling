'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FadeIn, Stagger, StaggerItem, HoverLift } from '@/components/ui/animate'
import { BookOpen, Plus, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { SafeDate } from '@/components/safe-format'

interface Story {
  id: string
  title: string
  description: string
  updatedAt: string
  _count: { parts: number }
}

export function StoriesClient() {
  const [stories, setStories] = useState<Story[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const load = useCallback(async () => {
    const res = await fetch('/api/stories')
    if (res.ok) setStories(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const create = async () => {
    if (!title.trim()) return
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })
    if (res.ok) {
      const story = await res.json()
      toast.success('Story created')
      setTitle('')
      setDescription('')
      setOpen(false)
      router.push(`/stories/${story.id}`)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this story and all its parts?')) return
    await fetch(`/api/stories/${id}`, { method: 'DELETE' })
    toast.success('Story deleted')
    load()
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Stories</h1>
            <p className="text-muted-foreground mt-1">Manage your storytelling projects.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Story</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Story</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My story" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
                </div>
                <Button onClick={create} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </FadeIn>

      {(stories?.length ?? 0) === 0 ? (
        <FadeIn>
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No stories yet. Create your first one.</p>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.05}>
          {stories.map((s) => (
            <StaggerItem key={s.id}>
              <HoverLift>
                <Card
                  className="cursor-pointer"
                  onClick={() => router.push(`/stories/${s.id}`)}
                >
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{s.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">{s.description || 'No description'}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); router.push(`/stories/${s.id}`) }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); remove(s.id) }}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{s?._count?.parts ?? 0} parts</span>
                      <SafeDate date={s.updatedAt} options={{ dateStyle: 'medium' }} />
                    </div>
                  </CardContent>
                </Card>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
