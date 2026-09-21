export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  if (!(await validateApiKey(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stories = await prisma.story.findMany({
    include: { _count: { select: { parts: true } }, parts: { where: { isPublished: true }, select: { id: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(stories.map((s: any) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    partCount: s._count?.parts ?? 0,
    publishedPartCount: s.parts?.length ?? 0,
  })))
}
