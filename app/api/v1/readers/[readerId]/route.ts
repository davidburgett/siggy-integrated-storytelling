export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ readerId: string }> }) {
  if (!(await validateApiKey(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { readerId } = await params

  const reader = await prisma.reader.findUnique({
    where: { id: readerId },
    include: {
      state: { include: { currentPart: { select: { id: true, title: true } } } },
      _count: { select: { history: true } },
    },
  })
  if (!reader) return NextResponse.json({ error: 'Reader not found' }, { status: 404 })

  return NextResponse.json({
    id: reader.id,
    externalId: reader.externalId,
    storyId: reader.storyId,
    label: reader.label,
    currentPartId: reader?.state?.currentPartId ?? null,
    currentPartTitle: reader?.state?.currentPart?.title ?? null,
    partsRead: reader?._count?.history ?? 0,
  })
}
