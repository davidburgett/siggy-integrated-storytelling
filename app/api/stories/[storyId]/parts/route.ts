export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ storyId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { storyId } = await params

  const parts = await prisma.part.findMany({
    where: { storyId },
    include: { type: true, decisionPoints: { include: { choices: true }, orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(parts)
}

export async function POST(req: Request, { params }: { params: Promise<{ storyId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { storyId } = await params
  const { title, typeId, content, sortOrder, tags, isPublished } = await req.json()

  const maxOrder = await prisma.part.aggregate({ where: { storyId }, _max: { sortOrder: true } })
  const part = await prisma.part.create({
    data: {
      storyId,
      title: title || 'Untitled Part',
      typeId: typeId || null,
      content: content || '',
      sortOrder: sortOrder ?? ((maxOrder._max.sortOrder ?? -1) + 1),
      tags: tags || [],
      isPublished: isPublished ?? false,
    },
    include: { type: true },
  })
  return NextResponse.json(part, { status: 201 })
}
