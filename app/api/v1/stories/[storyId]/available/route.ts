export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ storyId: string }> }) {
  if (!(await validateApiKey(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { storyId } = await params
  const url = new URL(req.url)
  const readerId = url.searchParams.get('readerId')
  if (!readerId) return NextResponse.json({ error: 'readerId query param required' }, { status: 400 })

  const reader = await prisma.reader.findUnique({ where: { id: readerId } })
  if (!reader) return NextResponse.json({ error: 'Reader not found' }, { status: 404 })

  const readPartIds = (await prisma.readHistory.findMany({
    where: { readerId },
    select: { partId: true },
  })).map((h: any) => h.partId)

  const allPublished = await prisma.part.findMany({
    where: { storyId, isPublished: true },
    include: { type: true, decisionPoints: { include: { choices: true }, orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })

  const unread = (allPublished ?? []).filter((p: any) => !readPartIds.includes(p.id))
  const nextPart = unread[0] ?? null

  const state = await prisma.readerState.findUnique({
    where: { readerId },
    include: { currentPart: { include: { decisionPoints: { include: { choices: true }, orderBy: { sortOrder: 'asc' } } } } },
  })

  const currentDecisionPoints = (state?.currentPart?.decisionPoints ?? []).map((dp: any) => ({
    id: dp.id,
    prompt: dp.prompt,
    choices: (dp?.choices ?? []).map((c: any) => ({ id: c.id, label: c.label, targetPartId: c.targetPartId })),
  }))

  const unreadTags = new Set<string>()
  unread.forEach((p: any) => {
    const tags = (p?.tags as string[] | null) ?? []
    tags.forEach((t: string) => unreadTags.add(t))
  })

  return NextResponse.json({
    unreadCount: unread.length,
    nextPart: nextPart ? { id: nextPart.id, title: nextPart.title, sortOrder: nextPart.sortOrder } : null,
    currentPartId: state?.currentPartId ?? null,
    currentDecisionPoints,
    unreadTags: [...unreadTags],
  })
}
