export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ dpId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { dpId } = await params
  const { label, targetPartId } = await req.json()
  if (!label) return NextResponse.json({ error: 'Label is required' }, { status: 400 })

  const choice = await prisma.decisionChoice.create({
    data: { decisionPointId: dpId, label, targetPartId: targetPartId || null },
  })
  return NextResponse.json(choice, { status: 201 })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, label, targetPartId } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const choice = await prisma.decisionChoice.update({
    where: { id },
    data: { label, targetPartId: targetPartId || null },
  })
  return NextResponse.json(choice)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await prisma.decisionChoice.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
