import { PartEditorClient } from './_components/part-editor-client'

export const dynamic = 'force-dynamic'

export default async function PartEditorPage({ params }: { params: Promise<{ storyId: string; partId: string }> }) {
  const { storyId, partId } = await params
  return <PartEditorClient storyId={storyId} partId={partId} />
}
