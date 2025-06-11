// src/pages/dashboard.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Project } from '@/types/project'
import ProjectCard from '@/components/ProjectCard'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data))
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <Link
          href="/projects/new"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
        >
          + New Project
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map(p => (
          <Link
            key={p._id}
            href={`/projects/${p._id}`}
            className="block"
          >
            <ProjectCard project={p} />
          </Link>
        ))}
      </div>
    </div>
  )
}
