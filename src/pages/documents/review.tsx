// src/pages/documents/review.tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { AnnotatedMetaphor } from '@/types/annotatedMetaphor'
import MetaphorGrid from '@/components/MetaphorGrid'

export default function DocumentReviewPage() {
  const router = useRouter()
  const { documentId } = router.query
  const [metaphors, setMetaphors] = useState<AnnotatedMetaphor[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMetaphors = () => {
    if (typeof documentId === 'string') {
      setLoading(true)
      api
        .get<AnnotatedMetaphor[]>(`/annotated-metaphors/document/${documentId}`)
        .then(res => setMetaphors(res.data))
        .finally(() => setLoading(false))
    }
  }

  useEffect(fetchMetaphors, [documentId])

  const handleAction = (id: string, action: 'approve' | 'to_edit' | 'discarded' | 'metonymy') => {
    api
      .patch(`/annotated-metaphors/${id}/${action}`)
      .then(fetchMetaphors)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Review Metaphors</h1>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <MetaphorGrid metaphors={metaphors} onAction={handleAction} />
      )}
    </div>
  )
}
