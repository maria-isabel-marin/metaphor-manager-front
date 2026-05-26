// src/pages/_app.tsx
import '../../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

const PUBLIC_ROUTES = ['/', '/auth/success']

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
      retry: (failureCount, error: any) => {
        // No reintentar en errores 4xx
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: process.env.NODE_ENV === 'production', // Solo en producción
    },
    mutations: {
      retry: 1,
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter()
  const isPublic = PUBLIC_ROUTES.includes(pathname)

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {isPublic ? (
          <Component {...pageProps} />
        ) : (
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        )}
      </AuthProvider>
      {/* React Query Devtools solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
