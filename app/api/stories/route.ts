export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stories = await prisma.story.findMany({
    include: { _count: { select: { parts: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(stories)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description } = await request.json()
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const story = await prisma.story.create({
    data: { title, description: description || '' },
  })
  return NextResponse.json(story, { status: 201 })
}
