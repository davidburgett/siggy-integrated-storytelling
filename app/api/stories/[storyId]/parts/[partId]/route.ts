export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ storyId: string; partId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { partId } = await params

  const part = await prisma.part.findUnique({
    where: { id: partId },
    include: { type: true, decisionPoints: { include: { choices: true }, orderBy: { sortOrder: 'asc' } } },
  })
  if (!part) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(part)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ storyId: string; partId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { partId } = await params
  const data = await req.json()

  const part = await prisma.part.update({
    where: { id: partId },
    data,
    include: { type: true, decisionPoints: { include: { choices: true }, orderBy: { sortOrder: 'asc' } } },
  })
  return NextResponse.json(part)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ storyId: string; partId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { partId } = await params

  await prisma.part.delete({ where: { id: partId } })
  return NextResponse.json({ ok: true })
}
