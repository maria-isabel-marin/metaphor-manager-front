import Link from 'next/link'
import { Document } from '@/types/document'

interface DocumentCardProps {
  document: Document
}

export default function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Link href={`/documents/${document._id}`} 
      className="block p-4 bg-white shadow hover:shadow-md transition-shadow rounded-lg">
        <h3 className="text-lg font-semibold">{document.title}</h3>
        <p className="text-sm text-gray-500">{document.type} • {document.language}</p>
        <p className="mt-2 text-gray-700">
          Status: <span className="font-medium capitalize">{document.status}</span>
        </p>
        {document.notes && (
          <p className="mt-1 text-gray-600 italic">{document.notes}</p>
        )}
    </Link>
  )
}
