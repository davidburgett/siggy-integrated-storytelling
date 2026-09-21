import { StoryDetailClient } from './_components/story-detail-client'

export const dynamic = 'force-dynamic'

export default async function StoryDetailPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = await params
  return <StoryDetailClient storyId={storyId} />
}
