export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ readerId: string }> }) {
  if (!(await validateApiKey(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { readerId } = await params
  const { choiceId } = await req.json()
  if (!choiceId) return NextResponse.json({ error: 'choiceId required' }, { status: 400 })

  const choice = await prisma.decisionChoice.findUnique({
    where: { id: choiceId },
    include: { decisionPoint: true },
  })
  if (!choice || !choice.targetPartId) return NextResponse.json({ error: 'Choice not found or has no target' }, { status: 404 })

  const reader = await prisma.reader.findUnique({ where: { id: readerId } })
  if (!reader) return NextResponse.json({ error: 'Reader not found' }, { status: 404 })

  // Mark the current part (the one containing this decision) as read
  const currentPartId = choice.decisionPoint?.partId
  if (currentPartId) {
    const alreadyRead = await prisma.readHistory.findFirst({ where: { readerId, partId: currentPartId } })
    if (!alreadyRead) {
      await prisma.readHistory.create({ data: { readerId, partId: currentPartId } })
    }
  }

  // Navigate to target
  await prisma.readerState.upsert({
    where: { readerId },
    update: { currentPartId: choice.targetPartId },
    create: { readerId, storyId: reader.storyId, currentPartId: choice.targetPartId },
  })

  // Fetch the target part
  const targetPart = await prisma.part.findUnique({
    where: { id: choice.targetPartId },
    include: { type: true, decisionPoints: { include: { choices: true }, orderBy: { sortOrder: 'asc' } } },
  })

  if (!targetPart) return NextResponse.json({ error: 'Target part not found' }, { status: 404 })

  return NextResponse.json({
    id: targetPart.id,
    title: targetPart.title,
    type: targetPart?.type?.name ?? null,
    content: targetPart.content,
    tags: (targetPart?.tags as string[] | null) ?? [],
    sortOrder: targetPart.sortOrder,
    decisionPoints: (targetPart?.decisionPoints ?? []).map((dp: any) => ({
      id: dp.id,
      prompt: dp.prompt,
      choices: (dp?.choices ?? []).map((c: any) => ({ id: c.id, label: c.label, targetPartId: c.targetPartId })),
    })),
  })
}
