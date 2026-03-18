import { useAuth } from '@/contexts/AuthContext'
import { StaggeredMenu, type StaggeredMenuItem } from '@/components/Staggered Menu/Staggered_Menu'

export function Navbar() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <header className="border-b border-zinc-800 bg-zinc-950/70 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-semibold text-white">CinéConnect</span>
          <span className="text-zinc-500">Chargement…</span>
        </div>
      </header>
    )
  }

  const baseItems: StaggeredMenuItem[] = [
    {
      label: 'Accueil',
      ariaLabel: "Aller à la page d'accueil",
      link: '/'
    },
    {
      label: 'Films',
      ariaLabel: 'Aller à la page des films',
      link: '/films'
    }
  ]

  const items: StaggeredMenuItem[] = user
    ? [
        ...baseItems,
        {
          label: 'Social',
          ariaLabel: 'Aller à la page de discussion',
          link: '/discussion'
        },
        {
          label: 'Profil',
          ariaLabel: 'Aller à la page profil',
          link: '/profil'
        }
      ]
    : [
        ...baseItems,
        {
          label: 'Connexion',
          ariaLabel: 'Aller à la page de connexion',
          link: '/login'
        },
        {
          label: 'Inscription',
          ariaLabel: "Aller à la page d'inscription",
          link: '/register'
        }
      ]

  return (
    <header className="relative z-40 border-b border-zinc-800 bg-zinc-950/70">
      <StaggeredMenu
        isFixed={false}
        position="right"
        items={items}
        displaySocials={false}
        displayItemNumbering={false}
        className="h-16"
        logoUrl="/logo.svg"
        menuButtonColor="#e9e9ef"
        openMenuButtonColor="#111111"
        changeMenuColorOnOpen={true}
      />
    </header>
  )
}
