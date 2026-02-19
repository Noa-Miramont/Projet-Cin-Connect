import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/Navbar'

export const Route = createRootRoute({
  component: RootLayout
})

function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
