// src/components/DocumentCard.tsx

import { Document } from '@/types/document'
import { formatDistanceToNow } from 'date-fns'

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
  onEdit?: () => void;
  onView?: () => void;
  onUpload?: () => void;
  isReviewer?: boolean;
}

export default function DocumentCard({
  document,
  onDelete,
  onEdit,
  onView,
  onUpload,
  isReviewer = false,
}: DocumentCardProps) {
  const timeAgo = formatDistanceToNow(new Date(document.createdAt), { addSuffix: true });

  return (
    <div className={`
      bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200
      border border-gray-100 overflow-hidden flex flex-col justify-between
      ${isReviewer ? 'border-l-4 border-l-indigo-500' : ''}
    `}>
      {/* Header & Body */}
      <div>
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-base font-semibold text-gray-800 line-clamp-1 flex-1">
              {document.title}
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                <img src="/window.svg" alt="Status" className="w-3 h-3 mr-1" />
                <span>{document.status || 'Draft'}</span>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {timeAgo}
              </span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <span className="flex items-center">
              <img src="/file.svg" alt="File type" className="w-4 h-4 mr-1" />
              {document.type || 'Text'}
            </span>
            <span className="mx-2">•</span>
            <span className="flex items-center">
              <img src="/globe.svg" alt="Language" className="w-4 h-4 mr-1" />
              {document.language || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-sm text-gray-600 line-clamp-3">
            {document.description || 'No description provided'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2">
          {onView && (
            <button
              onClick={onView}
              className="col-span-2 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark 
                       rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Manage Annotations
            </button>
          )}
          {onUpload && (
            <button
              onClick={onUpload}
              className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20
                       rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Upload Annotations
            </button>
          )}

          {!isReviewer && onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300
                       rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
              Edit
            </button>
          )}
        </div>
        {!isReviewer && onDelete && (
          <button
            onClick={() => onDelete(document._id)}
            className="w-full mt-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50
                     rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
