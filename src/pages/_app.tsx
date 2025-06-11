// src/pages/_app.tsx
import '../../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

const publicRoutes = ['/', '/auth/success']

export default function App({ Component, pageProps, router }: AppProps) {
  const isPublic = publicRoutes.includes(router.pathname)

  const page = isPublic ? (
    <Component {...pageProps} />
  ) : (
    <ProtectedRoute>
      <Component {...pageProps} />
    </ProtectedRoute>
  )

  return (
    <AuthProvider>
      {page}
    </AuthProvider>
  )
}
