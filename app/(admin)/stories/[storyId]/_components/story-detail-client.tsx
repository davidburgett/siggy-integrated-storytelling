'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FadeIn, HoverLift } from '@/components/ui/animate'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil, GripVertical, Eye, EyeOff, Palette, ArrowLeft } from 'lucide-react'

interface PartType { id: string; name: string; description: string; color: string }
interface Part {
  id: string; title: string; sortOrder: number; isPublished: boolean; tags: string[]
  type: PartType | null; decisionPoints: any[]
}
interface Story {
  id: string; title: string; description: string; partTypes: PartType[]; parts: Part[]
}

export function StoryDetailClient({ storyId }: { storyId: string }) {
  const [story, setStory] = useState<Story | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [typeName, setTypeName] = useState('')
  const [typeColor, setTypeColor] = useState('#6366f1')
  const [typeOpen, setTypeOpen] = useState(false)
  const [partTitle, setPartTitle] = useState('')
  const [partTypeId, setPartTypeId] = useState('')
  const [partOpen, setPartOpen] = useState(false)
  const router = useRouter()

  const load = useCallback(async () => {
    const res = await fetch(`/api/stories/${storyId}`)
    if (res.ok) {
      const data = await res.json()
      setStory(data)
      setEditTitle(data?.title ?? '')
      setEditDesc(data?.description ?? '')
    }
  }, [storyId])

  useEffect(() => { load() }, [load])

  const saveStory = async () => {
    await fetch(`/api/stories/${storyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, description: editDesc }),
    })
    toast.success('Story updated')
    load()
  }

  const addType = async () => {
    if (!typeName.trim()) return
    await fetch(`/api/stories/${storyId}/part-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: typeName, color: typeColor }),
    })
    setTypeName(''); setTypeColor('#6366f1'); setTypeOpen(false)
    toast.success('Part type created')
    load()
  }

  const removeType = async (typeId: string) => {
    if (!confirm('Delete this part type?')) return
    await fetch(`/api/stories/${storyId}/part-types/${typeId}`, { method: 'DELETE' })
    toast.success('Part type deleted')
    load()
  }

  const addPart = async () => {
    const res = await fetch(`/api/stories/${storyId}/parts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: partTitle || 'Untitled Part', typeId: partTypeId || null }),
    })
    if (res.ok) {
      const part = await res.json()
      setPartTitle(''); setPartTypeId(''); setPartOpen(false)
      toast.success('Part created')
      router.push(`/stories/${storyId}/parts/${part.id}`)
    }
  }

  const removePart = async (partId: string) => {
    if (!confirm('Delete this part?')) return
    await fetch(`/api/stories/${storyId}/parts/${partId}`, { method: 'DELETE' })
    toast.success('Part deleted')
    load()
  }

  const togglePublish = async (partId: string, current: boolean) => {
    await fetch(`/api/stories/${storyId}/parts/${partId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !current }),
    })
    load()
  }

  if (!story) return <div className="text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-8">
      <FadeIn>
        <Button variant="ghost" onClick={() => router.push('/stories')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Stories
        </Button>
      </FadeIn>

      <Tabs defaultValue="parts">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-display font-bold tracking-tight">{story.title}</h1>
          <TabsList>
            <TabsTrigger value="parts">Parts</TabsTrigger>
            <TabsTrigger value="types">Part Types</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="parts" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={partOpen} onOpenChange={setPartOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> New Part</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Part</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={partTitle} onChange={(e) => setPartTitle(e.target.value)} placeholder="Part title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Type (optional)</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={partTypeId}
                      onChange={(e) => setPartTypeId(e.target.value)}
                    >
                      <option value="">No type</option>
                      {(story?.partTypes ?? []).map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={addPart} className="w-full">Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(story?.parts?.length ?? 0) === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">No parts yet. Create your first one.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {(story?.parts ?? []).map((part, _i) => (
                <HoverLift key={part.id}>
                  <Card
                    className="cursor-pointer"
                    onClick={() => router.push(`/stories/${storyId}/parts/${part.id}`)}
                  >
                    <CardContent className="flex items-center gap-4 py-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{part.title}</span>
                          {part.type && (
                            <Badge variant="outline" style={{ borderColor: part.type.color, color: part.type.color }}>
                              {part.type.name}
                            </Badge>
                          )}
                          {(part?.tags as string[] ?? []).slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Order: {part.sortOrder} · {(part?.decisionPoints?.length ?? 0)} decision points
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => { e.stopPropagation(); togglePublish(part.id, part.isPublished) }}
                        title={part.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {part.isPublished ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => { e.stopPropagation(); removePart(part.id) }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                </HoverLift>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={typeOpen} onOpenChange={setTypeOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> New Part Type</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Part Type</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={typeName} onChange={(e) => setTypeName(e.target.value)} placeholder="e.g. Chapter, Interlude, Epilogue" />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={typeColor} onChange={(e) => setTypeColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer" />
                      <Input value={typeColor} onChange={(e) => setTypeColor(e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <Button onClick={addType} className="w-full">Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(story?.partTypes?.length ?? 0) === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">No part types defined. Create types like "Chapter", "Epilogue", etc.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(story?.partTypes ?? []).map((t) => (
                <Card key={t.id}>
                  <CardContent className="flex items-center gap-3 py-3">
                    <Palette className="h-4 w-4" style={{ color: t.color }} />
                    <span className="font-medium flex-1">{t.name}</span>
                    <Button variant="ghost" size="icon-sm" onClick={() => removeType(t.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 max-w-lg">
          <Card>
            <CardHeader><CardTitle>Story Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
              </div>
              <Button onClick={saveStory}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
