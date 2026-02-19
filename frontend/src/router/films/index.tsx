import { createFileRoute } from '@tanstack/react-router'
import { FilmsPage } from '@/pages/Films'

export const Route = createFileRoute('/films/')({
  component: FilmsPage
})
