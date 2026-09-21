export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ storyId: string; partId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { partId } = await params
  const { prompt, sortOrder } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })

  const maxOrder = await prisma.decisionPoint.aggregate({ where: { partId }, _max: { sortOrder: true } })
  const dp = await prisma.decisionPoint.create({
    data: {
      partId,
      prompt,
      sortOrder: sortOrder ?? ((maxOrder._max.sortOrder ?? -1) + 1),
    },
    include: { choices: true },
  })
  return NextResponse.json(dp, { status: 201 })
}
