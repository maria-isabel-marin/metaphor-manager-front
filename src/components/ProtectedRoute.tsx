import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!token) {
      const currentPath = router.asPath
      if (currentPath && currentPath !== '/') {
        localStorage.setItem('postLoginRedirect', currentPath)
      }
      router.replace('/')
    }
  }, [token, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        Redirecting...
      </div>
    )
  }

  return <>{children}</>
}