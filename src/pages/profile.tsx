import Layout from '@/components/Layout'
import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const { user, loading } = useAuth()

  if (loading) return <Layout><div className="mt-8 text-center">Loading profile…</div></Layout>
  if (!user) return <Layout><div className="mt-8 text-center text-red-600">Restricted access. Please sign in to view your profile.</div></Layout>

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white p-8 rounded shadow mt-8">
        <h1 className="text-3xl font-bold mb-4">User Profile</h1>
        <div className="mb-2"><b>Name:</b> {user.name || 'No name'}</div>
        <div className="mb-2"><b>Email:</b> {user.email}</div>
        <div className="mb-2"><b>Role:</b> {user.role}</div>
      </div>
    </Layout>
  )
} 