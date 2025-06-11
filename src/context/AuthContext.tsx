// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'

interface AuthContextData {
  token: string | null
  loginWithGoogle: () => void
  logout: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthContext = createContext<AuthContextData | null>(null)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('accessToken')
    if (saved) {
      setToken(saved)
    }

    if (router.pathname === '/auth/success' && router.query.token) {
      const t = String(router.query.token)
      localStorage.setItem('accessToken', t)
      setToken(t)
      router.replace('/dashboard')
    }
  }, [router])

  const loginWithGoogle = () => {
    window.location.href = `/auth/google` // Proxy to backend
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setToken(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ token, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
