export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ readerId: string }> }) {
  if (!(await validateApiKey(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { readerId } = await params
  const { partId } = await req.json()
  if (!partId) return NextResponse.json({ error: 'partId required' }, { status: 400 })

  const reader = await prisma.reader.findUnique({ where: { id: readerId } })
  if (!reader) return NextResponse.json({ error: 'Reader not found' }, { status: 404 })

  // Set position
  await prisma.readerState.upsert({
    where: { readerId },
    update: { currentPartId: partId },
    create: { readerId, storyId: reader.storyId, currentPartId: partId },
  })

  const part = await prisma.part.findUnique({
    where: { id: partId },
    include: { type: true, decisionPoints: { include: { choices: true }, orderBy: { sortOrder: 'asc' } } },
  })
  if (!part) return NextResponse.json({ error: 'Part not found' }, { status: 404 })

  return NextResponse.json({
    id: part.id,
    title: part.title,
    type: part?.type?.name ?? null,
    content: part.content,
    tags: (part?.tags as string[] | null) ?? [],
    sortOrder: part.sortOrder,
    decisionPoints: (part?.decisionPoints ?? []).map((dp: any) => ({
      id: dp.id,
      prompt: dp.prompt,
      choices: (dp?.choices ?? []).map((c: any) => ({ id: c.id, label: c.label, targetPartId: c.targetPartId })),
    })),
  })
}
