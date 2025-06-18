// src/components/ProjectCard.tsx

import Link from 'next/link'
import { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
  onDelete?: (id: string) => void
  onView?: () => void
}

export default function ProjectCard({
  project,
  onDelete,
  onView,
}: ProjectCardProps) {
  const createdAt = new Date(project.createdAt).toLocaleDateString()
  // Si en el futuro añades un campo `imageUrl` en el proyecto,
  // usa esa URL; si no, carga la imagen por defecto:
 // const headerImage = project['imageUrl'] /* ó project.imageUrl */ || '/images/default-project.jpg'
 const headerImage = '/images/default-project.avif'


  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col">
      {/* Header image placeholder */}
      <div className="h-40 w-full">
        <img
          src={headerImage}
          alt={`${project.name} cover`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Date */}
        <span className="text-xs text-gray-500">{createdAt}</span>
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mt-1">
          {project.name}
        </h3>
        {/* Description */}
        <p className="text-gray-600 mt-2 flex-1 line-clamp-3">
          {project.description}
        </p>
      </div>

      <div className="px-4 pb-4 flex items-center justify-between text-sm text-gray-500">
        {onView ? (
          <button
            onClick={onView}
            className="hover:text-indigo-600 focus:outline-none"
          >
            View
          </button>
        ) : (
          <Link
            href={`/projects/${project._id}/documents`}
            className="hover:text-indigo-600"
          >
            View
          </Link>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(project._id)}
            className="hover:text-red-600 focus:outline-none"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
