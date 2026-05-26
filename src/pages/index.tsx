// src/pages/index.tsx
import { getGoogleAuthUrl } from '@/lib/googleAuth'
import Link from 'next/link'

export default function IndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-800">
          Welcome to Metaphor Manager
        </h1>
        <p className="text-gray-600 mb-6">
          Record and review annotated conceptual metaphors.
        </p>

        <button
          onClick={() => window.location.assign(getGoogleAuthUrl())}
          className="w-full py-3 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
