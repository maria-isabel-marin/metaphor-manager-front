// src/pages/projects/[projectId]/documents/index.tsx

import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import Layout from '@/components/Layout'
import DocumentCard from '@/components/DocumentCard'
import AnnotationUploadModal from '@/components/AnnotationUploadModal'
import DocumentModal from '@/components/DocumentModal'
import { Document } from '@/types/document'
import Breadcrumb from '@/components/Breadcrumb'
import { PlusIcon } from '@heroicons/react/24/solid'

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
  const [selectedDocument, setSelectedDocument] = useState<Document | undefined>(undefined)

  // controls Document modal
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)

  // controls Upload Annotations modal
  const [uploadDocId, setUploadDocId] = useState<string | null>(null)

  const loadAll = useCallback(() => {
    if (!projectId) return
    setLoading(true)
    api.get(`/projects/${projectId}`)
      .then(res => setProject(res.data))
      .catch(() => setProject(null))

    api.get<Document[]>(`/documents/project/${projectId}`)
      .then(res => setDocuments(res.data))
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document)
    setIsDocModalOpen(true)
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    try {
      await api.delete(`/documents/${id}`)
      loadAll()
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    }
  }

  return (
    <Layout breadcrumb={<Breadcrumb items={[
      { label: 'Projects', href: '/projects' },
      { label: project?.name || 'Project' }
    ]} />}>
      {/** Document modal (new/edit) **/}
      <DocumentModal
        projectId={projectId!}
        isOpen={isDocModalOpen}
        onClose={() => {
          setIsDocModalOpen(false)
          setSelectedDocument(undefined)
        }}
        onSaved={() => {
          setIsDocModalOpen(false)
          setSelectedDocument(undefined)
          loadAll()
        }}
        document={selectedDocument}
      />

      {/** Upload‐Annotations modal **/}
      {uploadDocId && (
        <AnnotationUploadModal
          projectId={projectId!}
          documentId={uploadDocId}
          isOpen={!!uploadDocId}
          onClose={() => setUploadDocId(null)}
          onUploaded={() => {
            // Refresh documents in the background, modal stays open for summary
            loadAll()
          }}
        />
      )}

      <div className="space-y-6 w-full">
        {/** Page Header **/}
        <div className="flex flex-wrap justify-between items-center gap-4 w-full">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Documents</h1>
            <p className="text-gray-500 mt-1">Manage documents for {project?.name || 'this project'}.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/projects/${projectId}/all-metaphors`)}
              className="px-4 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              All Metaphors
            </button>
            <button
              onClick={() => router.push('/domains/relations')}
              className="px-4 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              Manage Domain Relations
            </button>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm transition hover:bg-primary-dark"
            >
              <PlusIcon className="w-5 h-5" />
              New Document
            </button>
          </div>
        </div>

        {loading ? (
          <div className="w-full text-center py-12 text-gray-500">Loading documents...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onEdit={() => handleEditDocument(doc)}
                onDelete={handleDeleteDocument}
                onView={() => router.push(`/projects/${projectId}/documents/${doc._id}/annotations`)}
                onUpload={() => setUploadDocId(doc._id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
