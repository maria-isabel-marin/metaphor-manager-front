// src/pages/projects/[projectId]/documents/index.tsx

import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import Layout from '@/components/Layout'
import DocumentCard from '@/components/DocumentCard'
import AnnotationUploadModal from '@/components/AnnotationUploadModal'

import DocumentModal from '@/components/DocumentModal'
import { Document } from '@/types/document'

console.log({
  Layout:   typeof Layout,
  DocModal: typeof DocumentModal,
  UpModal:  typeof AnnotationUploadModal,
  DocCard:  typeof DocumentCard,
})

export default function ProjectDocumentsPage() {
  const router = useRouter()
  const { projectId } = router.query as { projectId?: string }

  const [project, setProject] = useState<{ name: string; description: string } | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  // controls New Document modal
  const [isNewDocOpen, setIsNewDocOpen] = useState(false)

  // controls Upload Annotations modal
  const [uploadDocId, setUploadDocId] = useState<string | null>(null)

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
      {/** New‐Document modal **/}
      <DocumentModal
        projectId={projectId!}
        isOpen={isNewDocOpen}
        onClose={() => setIsNewDocOpen(false)}
        onCreated={() => {
          setIsNewDocOpen(false)
          loadAll()
        }}
      />

      {/** Upload‐Annotations modal **/}
      {uploadDocId && (
        <AnnotationUploadModal
          projectId={projectId!}
          documentId={uploadDocId}
          isOpen={!!uploadDocId}
          onClose={() => setUploadDocId(null)}
          onUploaded={(count) => {
            alert(`${count} metaphors imported.`)
            setUploadDocId(null)
            loadAll()
          }}
        />
      )}

      <div className="space-y-6">
        {project && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
        )}

        {/** action bar **/}
        <div className="flex flex-wrap justify-between items-center">
          <button
            onClick={() => setIsNewDocOpen(true)}
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

        {loading ? (
          <div>Loading documents…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onDeleted={loadAll}
                onUpload={() => setUploadDocId(doc._id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
