import { createFileRoute } from '@tanstack/react-router'
import { FilmDetailPage } from '@/pages/FilmDetail'

export const Route = createFileRoute('/film/$id')({
  component: FilmDetailPage
})
