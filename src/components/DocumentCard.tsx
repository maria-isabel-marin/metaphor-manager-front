// front/src/components/DocumentCard.tsx

import { useRouter } from 'next/router'
import Link from 'next/link'
import api from '@/lib/api'
import { Document } from '@/types/document'

interface DocumentCardProps {
  document: Document
  onDeleted: () => void
}

export default function DocumentCard({ document, onDeleted }: DocumentCardProps) {
  const router = useRouter()
  const pdfUrl = document.filePdfUrl || null
  const txtUrl = document.fileTxtUrl || null

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      await api.delete(
        `/projects/${document.projectId}/documents/${document._id}`
      )
      onDeleted()
    } catch (err) {
      console.error(err)
      alert('Failed to delete document.')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col overflow-hidden">
      <div className="p-4 flex-1">
        <h3 className="text-lg font-semibold">{document.title}</h3>
        <p className="text-gray-500 text-sm">
          {document.type} • {document.language}
        </p>

        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            Download PDF
          </a>
        )}

        {txtUrl && (
          <a
            href={txtUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-blue-600 hover:underline ml-4"
          >
            Download TXT
          </a>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
        <Link href={`/projects/${document.projectId}/documents/${document._id}`}>
          Manage Annotated Metaphors
        </Link>
        <button onClick={handleDelete} className="text-red-600 hover:underline">
          Delete
        </button>
      </div>
    </div>
  )
}
