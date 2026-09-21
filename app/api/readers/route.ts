export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const readers = await prisma.reader.findMany({
    include: {
      story: { select: { title: true } },
      state: { include: { currentPart: { select: { title: true } } } },
      _count: { select: { history: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(readers)
}
