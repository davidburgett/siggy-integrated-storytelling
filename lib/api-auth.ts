import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'

export async function validateApiKey(request: Request): Promise<boolean> {
  const key = request.headers.get('X-API-Key')
  if (!key) return false

  const keyHash = createHash('sha256').update(key).digest('hex')
  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } })
  if (!apiKey) return false

  // Update last used timestamp (fire-and-forget)
  prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {})
  return true
}

export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex')
}
