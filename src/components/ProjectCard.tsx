// src/components/ProjectCard.tsx
import Link from 'next/link'
import { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
  onDelete?: (id: string) => void
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const createdAt = new Date(project.createdAt).toLocaleDateString()

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col">
      {/* IMAGEN de cabecera (placeholder) */}
      <div className="h-40 w-full bg-gray-200">
        {/* Si tu proyecto tuviera imagen: <img src={project.imageUrl} className="h-full w-full object-cover" /> */}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Fecha */}
        <span className="text-xs text-gray-500">{createdAt}</span>
        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-800 mt-1">{project.name}</h3>
        {/* Descripción */}
        <p className="text-gray-600 mt-2 flex-1 line-clamp-3">
          {project.description}
        </p>
      </div>

      <div className="px-4 pb-4 flex items-center justify-between text-sm text-gray-500">
        <Link href={`/projects/${project._id}`} className="hover:text-indigo-600">
          View
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(project._id)}
            className="hover:text-red-600"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
