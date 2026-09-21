export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ dpId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { dpId } = await params
  const data = await req.json()
  const dp = await prisma.decisionPoint.update({ where: { id: dpId }, data, include: { choices: true } })
  return NextResponse.json(dp)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ dpId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { dpId } = await params
  await prisma.decisionPoint.delete({ where: { id: dpId } })
  return NextResponse.json({ ok: true })
}
