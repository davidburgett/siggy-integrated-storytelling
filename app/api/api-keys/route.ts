export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { hashApiKey } from '@/lib/api-auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(keys.map((k: any) => ({ id: k.id, name: k.name, createdAt: k.createdAt, lastUsedAt: k.lastUsedAt })))
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const rawKey = 'sis_' + randomBytes(32).toString('hex')
  const keyHash = hashApiKey(rawKey)

  const apiKey = await prisma.apiKey.create({ data: { name, keyHash } })
  return NextResponse.json({ id: apiKey.id, name: apiKey.name, rawKey, createdAt: apiKey.createdAt }, { status: 201 })
}
