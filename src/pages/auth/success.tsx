// src/pages/auth/success.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AuthSuccessPage() {
  const router = useRouter()
  const { token } = router.query

  useEffect(() => {
    if (typeof token === 'string') {
      localStorage.setItem('accessToken', token)
      router.replace('/dashboard')
    }
  }, [token, router])

  return <div className="flex items-center justify-center h-screen">Logging you in…</div>
}
