export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ storyId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { storyId } = await params

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      partTypes: true,
      parts: {
        include: { type: true, decisionPoints: { include: { choices: true }, orderBy: { sortOrder: 'asc' } } },
        orderBy: { sortOrder: 'asc' },
      },
      _count: { select: { readers: true } },
    },
  })
  if (!story) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(story)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ storyId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { storyId } = await params
  const data = await req.json()

  const story = await prisma.story.update({ where: { id: storyId }, data })
  return NextResponse.json(story)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ storyId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { storyId } = await params

  await prisma.story.delete({ where: { id: storyId } })
  return NextResponse.json({ ok: true })
}
