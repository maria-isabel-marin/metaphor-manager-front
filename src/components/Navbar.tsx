// src/components/Navbar.tsx
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function Navbar() {
  const { token, logout } = useAuth()

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <Link href="/projects" className="text-2xl font-bold text-gray-800">
        Metaphor Manager
      </Link>
      <div className="flex items-center space-x-4">
        {token ? (
          <>
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Log Out
            </button>
          </>
        ) : (
          <Link
            href="/"
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}
