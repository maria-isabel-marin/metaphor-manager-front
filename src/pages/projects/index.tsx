// src/pages/projects/index.tsx
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import api from '@/lib/api'
import ProjectCard from '@/components/ProjectCard'
import ProjectModal from '@/components/ProjectModal'
import { useAuth } from '@/hooks/useAuth'
import { Project } from '@/types/project'

export default function ProjectsIndexPage() {
  const [projects, setProjects]     = useState<Project[]>([])
  const [loading, setLoading]       = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { logout }                  = useAuth()
  const router                      = useRouter()

  const loadProjects = useCallback(() => {
    setLoading(true)
    api.get<Project[]>('/projects')
      .then(res => setProjects(res.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

  const handleDelete = (id: string) => {
    if (!confirm('Delete this project?')) return
    api.delete(`/projects/${id}`).then(() =>
      setProjects(curr => curr.filter(p => p._id !== id))
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <div className="flex gap-4">
          {/* open the modal instead of navigating */}
          <button
            onClick={() => setIsModalOpen(true)}
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

      {/* New Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={proj => {
          // prepend the new project & close
          setProjects(curr => [proj, ...curr])
          setIsModalOpen(false)
        }}
      />

      <main className="flex-1 p-6">
        {loading ? (
          <div>Loading projects…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map(p => (
              <ProjectCard
                key={p._id}
                project={p}
                onDelete={handleDelete}
                // call router.push from parent so ProjectCard stays dumb
                onView={() => router.push(`/projects/${p._id}/documents`)}
              />
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
