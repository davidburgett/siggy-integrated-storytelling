export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  if (!(await validateApiKey(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { externalId, storyId, label } = await req.json()
  if (!externalId || !storyId) return NextResponse.json({ error: 'externalId and storyId required' }, { status: 400 })

  const reader = await prisma.reader.upsert({
    where: { externalId_storyId: { externalId, storyId } },
    update: { label: label ?? undefined },
    create: { externalId, storyId, label: label || null },
  })

  // Ensure reader state exists
  await prisma.readerState.upsert({
    where: { readerId: reader.id },
    update: {},
    create: { readerId: reader.id, storyId },
  })

  return NextResponse.json(reader)
}
