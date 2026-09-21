export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parts = await prisma.part.findMany({ select: { tags: true, storyId: true, story: { select: { title: true } } } })
  const tagMap: Record<string, { count: number; stories: Set<string> }> = {}

  for (const part of parts ?? []) {
    const tags = (part?.tags as string[] | null) ?? []
    for (const tag of tags) {
      if (!tagMap[tag]) tagMap[tag] = { count: 0, stories: new Set() }
      tagMap[tag].count++
      tagMap[tag].stories.add(part?.story?.title ?? 'Unknown')
    }
  }

  const result = Object.entries(tagMap ?? {}).map(([tag, data]) => ({
    tag,
    count: data?.count ?? 0,
    stories: [...(data?.stories ?? [])],
  })).sort((a, b) => (b?.count ?? 0) - (a?.count ?? 0))

  return NextResponse.json(result)
}
