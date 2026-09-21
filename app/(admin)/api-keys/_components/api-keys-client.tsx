'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { toast } from 'sonner'
import { Key, Plus, Trash2, Copy, AlertTriangle } from 'lucide-react'
import { SafeDate } from '@/components/safe-format'

interface ApiKeyItem { id: string; name: string; createdAt: string; lastUsedAt: string | null }

export function ApiKeysClient() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([])
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [newKey, setNewKey] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/api-keys')
    if (res.ok) setKeys(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const create = async () => {
    if (!name.trim()) return
    const res = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      const data = await res.json()
      setNewKey(data?.rawKey ?? '')
      setName('')
      load()
      toast.success('API key created')
    }
  }

  const revoke = async (id: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return
    await fetch(`/api/api-keys/${id}`, { method: 'DELETE' })
    toast.success('API key revoked')
    load()
  }

  const copyKey = () => {
    navigator?.clipboard?.writeText?.(newKey)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground mt-1">Manage keys for external applications.</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setNewKey('') }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Generate Key</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Generate API Key</DialogTitle></DialogHeader>
              {newKey ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Copy this key now</p>
                        <p className="text-xs text-muted-foreground">It will not be shown again.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input value={newKey} readOnly className="font-mono text-xs" />
                    <Button variant="outline" size="icon" onClick={copyKey}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={() => { setOpen(false); setNewKey('') }} className="w-full">Done</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Key Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Game" />
                  </div>
                  <Button onClick={create} className="w-full">Generate</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </FadeIn>

      {(keys?.length ?? 0) === 0 ? (
        <FadeIn>
          <Card className="text-center py-12">
            <CardContent>
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No API keys. Generate one to connect external apps.</p>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <Stagger className="space-y-2" staggerDelay={0.03}>
          {keys.map((k) => (
            <StaggerItem key={k.id}>
              <Card>
                <CardContent className="flex items-center gap-4 py-3">
                  <Key className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <span className="font-medium">{k.name}</span>
                    <p className="text-xs text-muted-foreground">
                      Created <SafeDate date={k.createdAt} options={{ dateStyle: 'medium' }} />
                      {k.lastUsedAt && <> · Last used <SafeDate date={k.lastUsedAt} options={{ dateStyle: 'medium' }} /></>}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => revoke(k.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
