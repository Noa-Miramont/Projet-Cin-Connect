import { createFileRoute } from '@tanstack/react-router'
import { DiscussionPage } from '@/pages/Discussion'

export const Route = createFileRoute('/discussion')({
  component: DiscussionPage
})
