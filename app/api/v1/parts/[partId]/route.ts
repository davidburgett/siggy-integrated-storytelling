export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ partId: string }> }) {
  if (!(await validateApiKey(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { partId } = await params

  const part = await prisma.part.findUnique({
    where: { id: partId },
    include: { type: true, decisionPoints: { include: { choices: true }, orderBy: { sortOrder: 'asc' } } },
  })
  if (!part || !part.isPublished) return NextResponse.json({ error: 'Part not found' }, { status: 404 })

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
