export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ storyId: string }> }) {
  if (!(await validateApiKey(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { storyId } = await params

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      partTypes: true,
      parts: {
        where: { isPublished: true },
        include: { type: true, decisionPoints: { include: { choices: true }, orderBy: { sortOrder: 'asc' } } },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
  if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 })

  const allTags = new Set<string>()
  const allDecisionPoints: any[] = []

  const parts = (story?.parts ?? []).map((p: any) => {
    const tags = (p?.tags as string[] | null) ?? []
    tags.forEach((t: string) => allTags.add(t))
    const dps = (p?.decisionPoints ?? []).map((dp: any) => ({
      id: dp.id,
      prompt: dp.prompt,
      choices: (dp?.choices ?? []).map((c: any) => ({ id: c.id, label: c.label, targetPartId: c.targetPartId })),
    }))
    dps.forEach((dp: any) => allDecisionPoints.push({ ...dp, partId: p.id }))
    return {
      id: p.id,
      title: p.title,
      type: p?.type?.name ?? null,
      sortOrder: p.sortOrder,
      tags,
      isPublished: p.isPublished,
      decisionPoints: dps,
    }
  })

  return NextResponse.json({
    story: { id: story.id, title: story.title, description: story.description },
    partTypes: (story?.partTypes ?? []).map((pt: any) => ({ id: pt.id, name: pt.name, color: pt.color })),
    parts,
    allTags: [...allTags],
    allDecisionPoints,
  })
}
