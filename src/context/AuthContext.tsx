// src/context/AuthContext.tsx

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react'
import { useRouter } from 'next/router'
import api, { authApi } from '@/lib/api'

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  googleId?: string
  columnPreferences?: Record<string, any>
}

export interface AuthContextData {
  token: string | null
  user: User | null
  loading: boolean            // <-- newly exposed
  loginWithGoogle: () => void
  logout: () => void
  columnPreferences: Record<string, any>
  setColumnPreferences: (prefs: Record<string, any>) => Promise<void>
  resetColumnPreferences: () => Promise<void>
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
  const [columnPreferences, setColumnPreferencesState] = useState<Record<string, any>>({})
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
      .get('/auth/profile')
      .then(res => {
        setUser({
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          avatar: res.data.avatar,
          googleId: res.data.googleId,
          columnPreferences: res.data.columnPreferences,
        })
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token])

  // Cargar preferencias al obtener usuario
  useEffect(() => {
    if (!token) return;
    api.get('/users/me/column-preferences').then(res => {
      setColumnPreferencesState(res.data || {});
    });
  }, [token]);

  const loginWithGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/auth/google`;
  }
  const logout = () => {
    localStorage.removeItem('accessToken')
    setToken(null)
    setUser(null)
    router.push('/')
  }

  const setColumnPreferences = async (prefs: Record<string, any>) => {
    await api.patch('/users/me/column-preferences', prefs);
    setColumnPreferencesState(prefs);
  };

  const resetColumnPreferences = async () => {
    await api.patch('/users/me/column-preferences', {});
    setColumnPreferencesState({});
  };

  return (
    <AuthContext.Provider
      value={{ token, user, loading, loginWithGoogle, logout, columnPreferences, setColumnPreferences, resetColumnPreferences }}
    >
      {children}
    </AuthContext.Provider>
  )
}
