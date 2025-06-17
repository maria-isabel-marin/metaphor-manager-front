// src/pages/projects/[projectId]/documents/index.tsx

import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import Layout from '@/components/Layout'
import DocumentCard from '@/components/DocumentCard'
import DocumentModal from '@/components/DocumentModal'
import { Document } from '@/types/document'

export default function ProjectDocumentsPage() {
  const router = useRouter()
  const { projectId } = router.query as { projectId?: string }
  const [project, setProject] = useState<{ name: string; description: string } | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Load project info and its documents
  const loadAll = useCallback(() => {
    if (!projectId) return
    setLoading(true)
    api.get(`/projects/${projectId}`)
      .then(res => setProject(res.data))
      .catch(() => setProject(null))
    api.get<Document[]>(`/projects/${projectId}/documents`)
      .then(res => setDocuments(res.data))
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return (
    <Layout>
      {/* New Document Modal */}
      <DocumentModal
        projectId={projectId!}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={loadAll}
      />

      <div className="space-y-6">
        {/* Project Header */}
        {project && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between items-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            + New Document
          </button>

          <div className="space-x-4">
            <button
              onClick={() => router.push(`/projects/${projectId}/all-metaphors`)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              All Metaphors
            </button>
            <button
              onClick={() => router.push('/domains/relations')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              Manage Domain Relations
            </button>
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div>Loading documents…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {documents.map(doc => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onDeleted={() =>
                  setDocuments(docs => docs.filter(d => d._id !== doc._id))
                }
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
