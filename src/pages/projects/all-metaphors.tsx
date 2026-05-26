// src/pages/projects/all-metaphors.tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { AnnotatedMetaphor } from '@/types/annotatedMetaphor'
import MetaphorGrid from '@/components/MetaphorGrid'

export default function AllMetaphorsPage() {
  const router = useRouter()
  const { projectId } = router.query
  const [metaphors, setMetaphors] = useState<AnnotatedMetaphor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof projectId === 'string') {
      setLoading(true)
      api
        .get<AnnotatedMetaphor[]>(`/annotated-metaphors/project/${projectId}`)
        .then(res => setMetaphors(res.data))
        .finally(() => setLoading(false))
    }
  }, [projectId])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">All Metaphors</h1>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <MetaphorGrid metaphors={metaphors} />
      )}
    </div>
  )
}
