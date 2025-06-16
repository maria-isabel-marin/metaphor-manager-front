// src/pages/projects/[projectId]/documents/index.tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Layout from '@/components/Layout'
import DocumentCard from '@/components/DocumentCard'
import { Document } from '@/types/document'

export default function ProjectDocumentsPage() {
  const router = useRouter()
  const { projectId } = router.query
  const [project, setProject] = useState<{ name: string; description: string } | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch project info
  useEffect(() => {
    if (typeof projectId === 'string') {
      api.get(`/projects/${projectId}`).then(res => {
        setProject(res.data)
      })
      api
        .get<Document[]>(`/projects/${projectId}/documents`)
        .then(res => setDocuments(res.data))
        .finally(() => setLoading(false))
    }
  }, [projectId])

  return (
    <Layout>
      <div className="space-y-6">
        {project && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center">
          <button
            onClick={() => router.push(`/projects/${projectId}/documents/new`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            + New Document
          </button>

          <div className="space-x-4">
            <button
              onClick={() => router.push(`/projects/${projectId}/all-metaphors`)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              All Metaphors
            </button>
            <button
              onClick={() => router.push('/domains/relations')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Manage Domain Relations
            </button>
          </div>
        </div>

        {loading ? (
          <div>Loading documents…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {documents.map(doc => (
              <DocumentCard key={doc._id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
