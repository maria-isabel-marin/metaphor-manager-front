// src/lib/googleAuth.ts
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

/**
 * Returns the full URL to initiate Google OAuth login on the backend.
 */
export function getGoogleAuthUrl(): string {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`
}

/**
 * Redirects the browser to the Google OAuth login URL.
 */
export function redirectToGoogleLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.assign(getGoogleAuthUrl())
  }
}
