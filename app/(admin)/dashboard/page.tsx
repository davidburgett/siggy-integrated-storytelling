import { prisma } from '@/lib/prisma'
import { DashboardClient } from './_components/dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [storyCount, partCount, publishedCount, readerCount, apiKeyCount] = await Promise.all([
    prisma.story.count(),
    prisma.part.count(),
    prisma.part.count({ where: { isPublished: true } }),
    prisma.reader.count(),
    prisma.apiKey.count(),
  ])

  return (
    <DashboardClient
      stats={{
        stories: storyCount,
        parts: partCount,
        published: publishedCount,
        readers: readerCount,
        apiKeys: apiKeyCount,
      }}
    />
  )
}
