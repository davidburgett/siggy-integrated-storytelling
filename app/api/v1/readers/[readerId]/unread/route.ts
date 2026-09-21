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

  const unread = await prisma.part.findMany({
    where: {
      storyId: reader.storyId,
      isPublished: true,
      id: { notIn: readPartIds?.length ? readPartIds : ['__none__'] },
    },
    select: { id: true, title: true, sortOrder: true, tags: true },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(unread)
}
