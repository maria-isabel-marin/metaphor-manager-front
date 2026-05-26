import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AuthSuccessPage() {
  const router = useRouter()
  const { token } = router.query

  useEffect(() => {
    if (typeof token === 'string') {
      localStorage.setItem('accessToken', token)

      const redirectTo = localStorage.getItem('postLoginRedirect') || '/projects'
      localStorage.removeItem('postLoginRedirect')

      router.replace(redirectTo)
    }
  }, [token, router])

  return (
    <div className="flex items-center justify-center h-screen">
      Logging you in…
    </div>
  )
}