// src/components/Navbar.tsx
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function Navbar() {
  const { logout } = useAuth()

  return (
    <nav className="bg-primary text-white shadow p-4 flex justify-between items-center w-full font-sans">
      <div className="flex items-center space-x-6">
        <Link href="/projects" className="text-2xl font-bold tracking-tight">
          Metaphor Manager
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/about" className="hover:text-blue-200 font-medium transition-colors">About</Link>
        <Link href="/profile" className="hover:text-blue-200 font-medium transition-colors">Profile</Link>
      </div>
      <div>
        <button
          onClick={logout}
          className="px-3 py-1 bg-secondary text-white rounded hover:bg-red-700 transition font-medium"
        >
          Log Out
        </button>
      </div>
    </nav>
  )
}
