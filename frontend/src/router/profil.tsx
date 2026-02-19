import { createFileRoute } from '@tanstack/react-router'
import { ProfilPage } from '@/pages/Profil'

export const Route = createFileRoute('/profil')({
  component: ProfilPage
})
