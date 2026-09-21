export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: Request, { params }: { params: Promise<{ keyId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { keyId } = await params
  await prisma.apiKey.delete({ where: { id: keyId } })
  return NextResponse.json({ ok: true })
}
