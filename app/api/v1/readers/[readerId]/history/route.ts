export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ readerId: string }> }) {
  if (!(await validateApiKey(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { readerId } = await params

  const history = await prisma.readHistory.findMany({
    where: { readerId },
    include: { part: { select: { id: true, title: true } } },
    orderBy: { readAt: 'asc' },
  })

  return NextResponse.json((history ?? []).map((h: any) => ({
    partId: h?.part?.id,
    partTitle: h?.part?.title ?? 'Unknown',
    readAt: h?.readAt,
  })))
}
