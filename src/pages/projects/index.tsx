// src/pages/projects/index.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '@/lib/api'
import ProjectCard from '@/components/ProjectCard'
import { useAuth } from '@/hooks/useAuth'
import { Project } from '@/types/project'

export default function ProjectsIndexPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    api.get<Project[]>('/projects')
      .then(res => setProjects(res.data))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Delete this project?')) {
      api.delete(`/projects/${id}`)
        .then(() => setProjects(cur => cur.filter(p => p._id !== id)))
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/projects/new')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            + New Project
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        {loading ? (
          <div>Loading projects…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map(p => (
              <ProjectCard key={p._id} project={p} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-4 text-center text-gray-600 text-sm">
        © 2025 AI-Driven Metaphor Field-Loop Theory. All rights reserved.
      </footer>
    </div>
  )
}
