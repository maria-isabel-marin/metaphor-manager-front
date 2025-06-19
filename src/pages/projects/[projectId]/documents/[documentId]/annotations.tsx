// src/pages/projects/[projectId]/documents/[documentId]/annotations.tsx

import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Layout from '@/components/Layout'
import AnnotationGrid from '@/components/AnnotationGrid'
import { useAuth } from '@/hooks/useAuth'
import Breadcrumb from '@/components/Breadcrumb'

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
    <Layout 
      fullWidth
      breadcrumb={<Breadcrumb items={[
        { label: 'Projects', href: '/projects' },
        { label: 'Project', href: `/projects/${projectId}/documents` },
        { label: 'Documents', href: `/projects/${projectId}/documents` },
        { label: 'Document', href: `/projects/${projectId}/documents/${documentId}` },
        { label: 'Annotations' }
      ]} />}
    >
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-6">Manage Annotations</h1>
        <div className="w-full">
          <AnnotationGrid
            projectId={projectId}
            documentId={documentId}
            role={role}
          />
        </div>
      </div>
    </Layout>
  )
}
