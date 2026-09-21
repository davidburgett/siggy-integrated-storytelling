export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ readerId: string }> }) {
  if (!(await validateApiKey(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { readerId } = await params

  const reader = await prisma.reader.findUnique({ where: { id: readerId } })
  if (!reader) return NextResponse.json({ error: 'Reader not found' }, { status: 404 })

  const readPartIds = (await prisma.readHistory.findMany({
    where: { readerId },
    select: { partId: true },
  })).map((h: any) => h.partId)

  const nextPart = await prisma.part.findFirst({
    where: {
      storyId: reader.storyId,
      isPublished: true,
      id: { notIn: readPartIds?.length ? readPartIds : ['__none__'] },
    },
    include: { type: true, decisionPoints: { include: { choices: true }, orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })

  if (!nextPart) return NextResponse.json(null)

  return NextResponse.json({
    id: nextPart.id,
    title: nextPart.title,
    type: nextPart?.type?.name ?? null,
    content: nextPart.content,
    tags: (nextPart?.tags as string[] | null) ?? [],
    sortOrder: nextPart.sortOrder,
    decisionPoints: (nextPart?.decisionPoints ?? []).map((dp: any) => ({
      id: dp.id,
      prompt: dp.prompt,
      choices: (dp?.choices ?? []).map((c: any) => ({ id: c.id, label: c.label, targetPartId: c.targetPartId })),
    })),
  })
}
