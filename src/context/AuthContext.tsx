// src/context/AuthContext.tsx

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react'
import { useRouter } from 'next/router'
import { authApi } from '@/lib/api'

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface AuthContextData {
  token: string | null
  user: User | null
  loading: boolean            // <-- newly exposed
  loginWithGoogle: () => void
  logout: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthContext = createContext<AuthContextData | null>(null)

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)  // loading state
  const router = useRouter()

  // 1) Load token from localStorage or handle /auth/success redirect
  useEffect(() => {
    const stored = localStorage.getItem('accessToken')
    if (stored) {
      setToken(stored)
    }

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

  // 2) Fetch profile whenever token changes
  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    setLoading(true)
    authApi
      .get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setUser({
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
        })
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
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
      value={{ token, user, loading, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
