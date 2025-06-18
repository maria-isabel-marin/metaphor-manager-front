// src/pages/_app.tsx
import '../../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

const PUBLIC_ROUTES = ['/', '/auth/success']

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter()
  const isPublic = PUBLIC_ROUTES.includes(pathname)

  return (
    <AuthProvider>
      {isPublic ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
    </AuthProvider>
  )
}
