// src/components/DocumentCard.tsx

import { Document } from '@/types/document'
import { formatDistanceToNow } from 'date-fns'
import React, { useState } from 'react'
import { 
  Bars3Icon, 
  ClockIcon, 
  DocumentTextIcon, 
  LanguageIcon, 
  EllipsisVerticalIcon, 
  PencilIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`
      bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300
      border border-gray-200 flex flex-col h-full
      ${isReviewer ? 'border-l-4 border-l-indigo-500' : ''}
    `}>
      {/* Card Body */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Content wrapper that grows */}
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-semibold text-gray-800 leading-tight pr-2">
              {document.title}
            </h3>
            <div className="relative flex-shrink-0">
              {!isReviewer && (onEdit || onUpload || onDelete) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} 
                  onBlur={() => setTimeout(() => setMenuOpen(false), 200)} 
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
              )}
              {menuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {onUpload && (
                     <button onClick={onUpload} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <ArrowUpTrayIcon className="w-4 h-4 text-gray-500"/>
                      Upload Annotations
                    </button>
                  )}
                  {onEdit && (
                    <button onClick={onEdit} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <PencilIcon className="w-4 h-4 text-gray-500"/>
                      Edit Details
                    </button>
                  )}
                  {onDelete && (
                    <>
                      <div className="border-t border-gray-100"></div>
                      <button onClick={() => onDelete(document._id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3">
                        <TrashIcon className="w-4 h-4"/>
                        Delete Document
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {document.description || 'No description provided.'}
          </p>
        </div>
        
        {/* Action button, pushed to the bottom */}
        {onView && (
          <button
            onClick={onView}
            className="w-full mt-4 px-3 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark 
                     rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Bars3Icon className="h-5 w-5" />
            Manage Annotations
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5" title={`Status: ${document.status || 'Draft'}`}>
            <CheckCircleIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium capitalize truncate">{document.status || 'Draft'}</span>
          </div>
          <div className="flex items-center gap-1.5" title={`Last update: ${timeAgo}`}>
            <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium truncate">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1.5" title={`Document Type: ${document.type || 'Text'}`}>
            <DocumentTextIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium truncate">{document.type || 'Text'}</span>
          </div>
          <div className="flex items-center gap-1.5" title={`Language: ${document.language || 'Unknown'}`}>
            <LanguageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium truncate">{document.language || 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
