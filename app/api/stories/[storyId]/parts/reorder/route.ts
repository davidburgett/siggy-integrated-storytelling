export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderedIds } = await req.json() as { orderedIds: string[] }
  if (!Array.isArray(orderedIds)) return NextResponse.json({ error: 'orderedIds required' }, { status: 400 })

  await prisma.$transaction(
    (orderedIds ?? []).map((id: string, i: number) =>
      prisma.part.update({ where: { id }, data: { sortOrder: i } })
    )
  )
  return NextResponse.json({ ok: true })
}
