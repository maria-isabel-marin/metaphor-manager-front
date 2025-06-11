import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.replace('/')
    }
  }, [token, router])

  // Optionally render a loading state while redirecting
  if (!token) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>
  }

  return <>{children}</>
}
