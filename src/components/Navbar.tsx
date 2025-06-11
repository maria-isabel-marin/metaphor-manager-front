// src/components/Navbar.tsx
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function Navbar() {
  const { token, logout } = useAuth()

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <Link 
        href="/dashboard" 
        className="text-xl font-bold text-gray-800 hover:text-gray-900"
      >
        Metaphor Manager
      </Link>
      {token && (
        <div className="space-x-4 flex items-center">
          <Link 
            href="/dashboard" 
            className="text-gray-700 hover:text-gray-900"
          >
            Projects
          </Link>
          <Link 
            href="/domains/relations" 
            className="text-gray-700 hover:text-gray-900"
          >
            Domain Relations
          </Link>
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Log Out
          </button>
        </div>
      )}
    </nav>
  )
}
