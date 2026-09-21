export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ readerId: string }> }) {
  if (!(await validateApiKey(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { readerId } = await params
  const { partId } = await req.json()
  if (!partId) return NextResponse.json({ error: 'partId required' }, { status: 400 })

  const reader = await prisma.reader.findUnique({ where: { id: readerId } })
  if (!reader) return NextResponse.json({ error: 'Reader not found' }, { status: 404 })

  // Check if already read
  const existing = await prisma.readHistory.findFirst({ where: { readerId, partId } })
  if (!existing) {
    await prisma.readHistory.create({ data: { readerId, partId } })
  }

  // Update state
  const state = await prisma.readerState.upsert({
    where: { readerId },
    update: { currentPartId: partId },
    create: { readerId, storyId: reader.storyId, currentPartId: partId },
  })

  const count = await prisma.readHistory.count({ where: { readerId } })

  return NextResponse.json({
    readerId,
    currentPartId: state.currentPartId,
    partsRead: count,
  })
}
