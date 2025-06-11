// src/pages/documents/[documentId].tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Document } from '@/types/document'

export default function DocumentPage() {
  const router = useRouter()
  const { documentId } = router.query
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof documentId === 'string') {
      api
        .get<Document>(`/documents/${documentId}`)
        .then(res => setDocument(res.data))
        .finally(() => setLoading(false))
    }
  }, [documentId])

  if (loading) return <div className="p-6">Loading…</div>
  if (!document) return <div className="p-6">Document not found</div>

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{document.title}</h1>
        <button
          onClick={() => router.back()}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          ← Back
        </button>
      </div>
      <p className="text-gray-700">{document.notes}</p>
      <div className="flex gap-4">
        <button
          onClick={() => router.push(`/documents/review?documentId=${documentId}`)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Review Metaphors
        </button>
        <form
          action={`${process.env.NEXT_PUBLIC_API_URL}/annotated-metaphors/bulk-import`}
          method="POST"
          encType="multipart/form-data"
        >
          <input type="hidden" name="documentId" value={documentId as string} />
          <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer">
            Upload Metaphors
            <input type="file" name="file" accept=".xlsx,.xls" className="hidden" />
          </label>
        </form>
      </div>
    </div>
  )
}
