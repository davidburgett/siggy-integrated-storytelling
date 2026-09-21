export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ storyId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { storyId } = await params
  const types = await prisma.partType.findMany({ where: { storyId }, orderBy: { name: 'asc' } })
  return NextResponse.json(types)
}

export async function POST(req: Request, { params }: { params: Promise<{ storyId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { storyId } = await params
  const { name, description, color } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const type = await prisma.partType.create({
    data: { storyId, name, description: description || '', color: color || '#6366f1' },
  })
  return NextResponse.json(type, { status: 201 })
}
