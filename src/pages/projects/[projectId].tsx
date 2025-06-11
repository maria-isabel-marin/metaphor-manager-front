// src/pages/projects/[projectId].tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Project } from '@/types/project'
import { Document } from '@/types/document'
import DocumentCard from '@/components/DocumentCard'

export default function ProjectPage() {
  const router = useRouter()
  const { projectId } = router.query
  const [project, setProject] = useState<Project | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof projectId === 'string') {
      setLoading(true)
      Promise.all([
        api.get<Project>(`/projects/${projectId}`),
        api.get<Document[]>(`/projects/${projectId}/documents`),
      ])
        .then(([projRes, docsRes]) => {
          setProject(projRes.data)
          setDocuments(docsRes.data)
        })
        .finally(() => setLoading(false))
    }
  }, [projectId])

  if (loading) return <div className="p-6">Loading…</div>
  if (!project) return <div className="p-6">Project not found</div>

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <Link
          href="/dashboard"
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          ← Back to Dashboard
        </Link>
      </div>
      <p className="text-gray-700">{project.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => (
          <DocumentCard key={doc._id} document={doc} />
        ))}
        <Link
          href={`/projects/${projectId}/documents/new`}
          className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-600 hover:bg-gray-50"
        >
          + New Document
        </Link>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => router.push(`/projects/all-metaphors?projectId=${projectId}`)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          View All Metaphors
        </button>
        <button
          onClick={() => router.push(`/domains/relations`)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          Manage Domain Relations
        </button>
      </div>
    </div>
  )
}
