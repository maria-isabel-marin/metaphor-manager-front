// src/context/AuthContext.tsx

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react'
import { useRouter } from 'next/router'
import api from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextData {
  token: string | null
  user: User | null
  loginWithGoogle: () => void
  logout: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthContext = createContext<AuthContextData | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // Load token from storage or handle redirect
  useEffect(() => {
    const stored = localStorage.getItem('accessToken')
    if (stored) setToken(stored)

    if (
      router.pathname === '/auth/success' &&
      typeof router.query.token === 'string'
    ) {
      const t = router.query.token
      localStorage.setItem('accessToken', t)
      setToken(t)
      router.replace('/projects')
    }
  }, [router])

  // Fetch user profile when token changes
  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }
    api
      .get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        const { sub, name, email } = res.data
        setUser({ id: sub, name, email })
      })
      .catch(() => {
        setUser(null)
      })
  }, [token])

  const loginWithGoogle = () => {
    window.location.href = `/auth/google`
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setToken(null)
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{ token, user, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
