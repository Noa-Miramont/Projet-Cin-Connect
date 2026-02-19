import { createFileRoute } from '@tanstack/react-router'
import { FilmsByCategoryPage } from '@/pages/FilmsByCategory'

export const Route = createFileRoute('/films/$category')({
  component: FilmsByCategoryPage
})
