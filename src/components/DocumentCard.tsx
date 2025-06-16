// src/components/DocumentCard.tsx
import Link from 'next/link'
import { Document } from '@/types/document'

export default function DocumentCard({ document }: { document: Document }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col">
      <div className="p-4 flex-1">
        <h3 className="text-lg font-semibold">{document.title}</h3>
        <p className="text-gray-500 text-sm">{document.type} • {document.language}</p>
      </div>
      <div className="px-4 py-2 bg-gray-50 flex justify-between">
        <Link href={`/documents/${document._id}`} className="text-indigo-600 hover:underline">
          View
        </Link>
      </div>
    </div>
  )
}
