// src/components/DocumentCard.tsx

import { useRouter } from 'next/router'
import api            from '@/lib/api'
import { Document }   from '@/types/document'

interface DocumentCardProps {
  document: Document
  onDeleted: () => void
  onUpload:   () => void
}

export default function DocumentCard({
  document,
  onDeleted,
  onUpload,
}: DocumentCardProps) {
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
    } catch {
      alert('Failed to delete document.')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col overflow-hidden">
      {/* content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800">{document.title}</h3>
        <p className="text-gray-500 text-sm mt-1">
          {document.type} &middot; {document.language}
        </p>

        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-blue-600 hover:underline"
          >
            Download PDF
          </a>
        )}
        {txtUrl && (
          <a
            href={txtUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-blue-600 hover:underline"
          >
            Download TXT
          </a>
        )}
      </div>

      {/* action buttons */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50">
        <button
          onClick={onUpload}
          className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded transition"
        >
          Upload Annotations
        </button>

        <button
          onClick={() =>
            router.push(
              `/projects/${document.projectId}/documents/${document._id}/annotations`
            )
          }
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition"
        >
          Manage Annotations
        </button>

        <button
          onClick={handleDelete}
          className="w-full py-2 border border-red-500 text-red-500 hover:bg-red-50 text-sm font-medium rounded transition"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
