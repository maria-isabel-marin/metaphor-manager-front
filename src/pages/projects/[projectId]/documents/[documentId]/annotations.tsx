// src/pages/projects/[projectId]/documents/[documentId]/annotations.tsx

import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Layout from '@/components/Layout'
import AnnotationGrid from '@/components/AnnotationGrid'
import { useAuth } from '@/hooks/useAuth'

export default function AnnotationsPage() {
  const router = useRouter()
  const { projectId, documentId } = router.query as {
    projectId?: string
    documentId?: string
  }

  const { user, loading } = useAuth()
  console.log('AnnotationsPage', { projectId, documentId, user, loading })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [loading, user, router])

  // Wait for Next.js to fill in the params
  if (!projectId || !documentId) return null

  // Show spinner while we fetch the user profile
  if (loading) return <div>Loading user…</div>

  // At this point, loading is false. If user is null, we redirect (above) and return nothing.
  if (!user) return null

  // Now TS knows `user` is non‐null
  const role = (user.role === 'editor' ? 'editor' : 'reviewer') as
    | 'editor'
    | 'reviewer'

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Manage Annotations</h1>
      <AnnotationGrid
        projectId={projectId}
        documentId={documentId}
        role={role}
      />
    </Layout>
  )
}
