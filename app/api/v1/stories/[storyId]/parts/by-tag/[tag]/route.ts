export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ storyId: string; tag: string }> }) {
  if (!(await validateApiKey(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { storyId, tag } = await params
  const decodedTag = decodeURIComponent(tag)

  const parts = await prisma.part.findMany({
    where: { storyId, isPublished: true },
    include: { type: true, decisionPoints: { include: { choices: true }, orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })

  const filtered = (parts ?? []).filter((p: any) => {
    const tags = (p?.tags as string[] | null) ?? []
    return tags.includes(decodedTag)
  })

  return NextResponse.json(filtered.map((p: any) => ({
    id: p.id,
    title: p.title,
    type: p?.type?.name ?? null,
    content: p.content,
    tags: (p?.tags as string[] | null) ?? [],
    sortOrder: p.sortOrder,
    decisionPoints: (p?.decisionPoints ?? []).map((dp: any) => ({
      id: dp.id,
      prompt: dp.prompt,
      choices: (dp?.choices ?? []).map((c: any) => ({ id: c.id, label: c.label, targetPartId: c.targetPartId })),
    })),
  })))
}
