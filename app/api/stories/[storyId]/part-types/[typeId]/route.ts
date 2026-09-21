export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ storyId: string; typeId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { typeId } = await params
  const data = await req.json()
  const type = await prisma.partType.update({ where: { id: typeId }, data })
  return NextResponse.json(type)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ storyId: string; typeId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { typeId } = await params
  await prisma.partType.delete({ where: { id: typeId } })
  return NextResponse.json({ ok: true })
}
