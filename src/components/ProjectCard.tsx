// src/components/ProjectCard.tsx

import Link from 'next/link'
import { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
  onDelete?: (id: string) => void
  onEdit?: () => void
  onView?: () => void
  isReviewer?: boolean
}

export default function ProjectCard({
  project,
  onDelete,
  onEdit,
  onView,
  isReviewer = false,
}: ProjectCardProps) {
  const createdAt = new Date(project.createdAt).toLocaleDateString()
  // Si en el futuro añades un campo `imageUrl` en el proyecto,
  // usa esa URL; si no, carga la imagen por defecto:
 // const headerImage = project['imageUrl'] /* ó project.imageUrl */ || '/images/default-project.jpg'
 const headerImage = '/images/default-project.avif'


  return (
    <div className={`bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col ${isReviewer ? 'border-l-4 border-indigo-500' : ''}`}>
      {/* Header image placeholder */}
      <div className="h-40 w-full">
        <img
          src={headerImage}
          alt={`${project.name} cover`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Role badge */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{createdAt}</span>
          {isReviewer && (
            <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
              Reviewer
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mt-1">
          {project.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mt-2 flex-1 line-clamp-3">
          {project.description}
        </p>

        {/* Owner info if reviewer */}
        {isReviewer && project.owner && (
          <div className="mt-2 text-sm text-gray-500">
            Owner: {typeof project.owner === 'object' ? project.owner.email : 'Unknown'}
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-center gap-2">
        <button
          onClick={onView}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View
        </button>
        {!isReviewer && onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit
          </button>
        )}
        {!isReviewer && onDelete && (
          <button
            onClick={() => onDelete(project._id)}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
