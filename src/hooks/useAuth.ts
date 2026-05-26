// src/hooks/useAuth.ts

import { useContext } from 'react'
import { AuthContext, AuthContextData } from '@/context/AuthContext'

/**
 * Custom React hook to access authentication context.
 * Returns the current token, user, loading flag, and auth actions.
 */
export function useAuth(): AuthContextData {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return ctx
}
