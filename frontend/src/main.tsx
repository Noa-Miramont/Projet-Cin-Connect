import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './router/routeTree.gen'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { LenisProvider } from '@/components/LenisProvider'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60
    }
  }
})

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LenisProvider>
        <AuthProvider>
          <NotificationsProvider>
            <RouterProvider router={router} />
          </NotificationsProvider>
        </AuthProvider>
      </LenisProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
