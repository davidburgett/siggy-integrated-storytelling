'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { FadeIn } from '@/components/ui/animate'
import { toast } from 'sonner'
import { ArrowLeft, Save, Plus, Trash2, X, GitBranch, Tag } from 'lucide-react'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false, loading: () => <div className="h-96 bg-muted rounded-md animate-pulse" /> })

interface PartType { id: string; name: string; color: string }
interface Choice { id: string; label: string; targetPartId: string | null }
interface DecisionPoint { id: string; prompt: string; sortOrder: number; choices: Choice[] }
interface Part {
  id: string; title: string; content: string; sortOrder: number
  tags: string[]; isPublished: boolean; typeId: string | null
  type: PartType | null; decisionPoints: DecisionPoint[]
}
interface StoryPart { id: string; title: string }

export function PartEditorClient({ storyId, partId }: { storyId: string; partId: string }) {
  const [part, setPart] = useState<Part | null>(null)
  const [partTypes, setPartTypes] = useState<PartType[]>([])
  const [allParts, setAllParts] = useState<StoryPart[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [typeId, setTypeId] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const load = useCallback(async () => {
    const [partRes, storyRes] = await Promise.all([
      fetch(`/api/stories/${storyId}/parts/${partId}`),
      fetch(`/api/stories/${storyId}`),
    ])
    if (partRes.ok) {
      const p = await partRes.json()
      setPart(p)
      setTitle(p?.title ?? '')
      setContent(p?.content ?? '')
      setTypeId(p?.typeId ?? '')
      setSortOrder(p?.sortOrder ?? 0)
      setTags((p?.tags as string[]) ?? [])
      setIsPublished(p?.isPublished ?? false)
    }
    if (storyRes.ok) {
      const s = await storyRes.json()
      setPartTypes(s?.partTypes ?? [])
      setAllParts((s?.parts ?? []).map((p: any) => ({ id: p.id, title: p.title })))
    }
  }, [storyId, partId])

  useEffect(() => { load() }, [load])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/stories/${storyId}/parts/${partId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, typeId: typeId || null, sortOrder, tags, isPublished }),
      })
      if (res.ok) {
        const updated = await res.json()
        setPart(updated)
        toast.success('Saved')
      }
    } catch { toast.error('Save failed') }
    setSaving(false)
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '_')
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  // Decision Points
  const addDecisionPoint = async () => {
    const res = await fetch(`/api/stories/${storyId}/parts/${partId}/decision-points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'New Decision' }),
    })
    if (res.ok) {
      toast.success('Decision point added')
      load()
    }
  }

  const updateDP = async (dpId: string, prompt: string) => {
    await fetch(`/api/stories/${storyId}/parts/${partId}/decision-points/${dpId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
  }

  const deleteDP = async (dpId: string) => {
    if (!confirm('Delete this decision point?')) return
    await fetch(`/api/stories/${storyId}/parts/${partId}/decision-points/${dpId}`, { method: 'DELETE' })
    toast.success('Decision point deleted')
    load()
  }

  const addChoice = async (dpId: string) => {
    await fetch(`/api/stories/${storyId}/parts/${partId}/decision-points/${dpId}/choices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'New Choice' }),
    })
    load()
  }

  const updateChoice = async (dpId: string, choiceId: string, label: string, targetPartId: string | null) => {
    await fetch(`/api/stories/${storyId}/parts/${partId}/decision-points/${dpId}/choices`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: choiceId, label, targetPartId }),
    })
  }

  const deleteChoice = async (dpId: string, choiceId: string) => {
    await fetch(`/api/stories/${storyId}/parts/${partId}/decision-points/${dpId}/choices`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: choiceId }),
    })
    load()
  }

  if (!part) return <div className="text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push(`/stories/${storyId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Story
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="published" className="text-sm">Published</Label>
              <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
            <Button onClick={save} loading={saving}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Metadata */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-2 space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold" />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <select
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
          >
            <option value="">No type</option>
            {partTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Sort Order</Label>
          <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2"><Tag className="h-4 w-4" /> Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag (e.g. million_points)"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          />
          <Button variant="outline" onClick={addTag}>Add</Button>
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-2" data-color-mode="dark">
        <Label>Content</Label>
        <MDEditor
          value={content}
          onChange={(val) => setContent(val ?? '')}
          height={500}
          preview="live"
        />
      </div>

      {/* Decision Points */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" /> Decision Points
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addDecisionPoint}>
            <Plus className="h-4 w-4 mr-1" /> Add Decision
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(part?.decisionPoints?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">No decision points. Add one to create branching paths.</p>
          )}
          {(part?.decisionPoints ?? []).map((dp) => (
            <Card key={dp.id} className="bg-muted/50">
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    defaultValue={dp.prompt}
                    onBlur={(e) => updateDP(dp.id, e.target.value)}
                    placeholder="Decision prompt..."
                    className="font-medium"
                  />
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteDP(dp.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-border">
                  {(dp?.choices ?? []).map((choice) => (
                    <div key={choice.id} className="flex items-center gap-2">
                      <Input
                        defaultValue={choice.label}
                        onBlur={(e) => updateChoice(dp.id, choice.id, e.target.value, choice.targetPartId)}
                        placeholder="Choice label"
                        className="flex-1"
                      />
                      <select
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[200px]"
                        defaultValue={choice.targetPartId ?? ''}
                        onChange={(e) => updateChoice(dp.id, choice.id, choice.label, e.target.value || null)}
                      >
                        <option value="">No target</option>
                        {allParts.filter((p) => p.id !== partId).map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                      <Button variant="ghost" size="icon-sm" onClick={() => deleteChoice(dp.id, choice.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => addChoice(dp.id)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Choice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
