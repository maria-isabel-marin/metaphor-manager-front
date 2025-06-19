// src/pages/projects/index.tsx
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import api from '@/lib/api'
import ProjectCard from '@/components/ProjectCard'
import ProjectModal from '@/components/ProjectModal'
import { useAuth } from '@/hooks/useAuth'
import { Project } from '@/types/project'
import Layout from '@/components/Layout'
import Breadcrumb from '@/components/Breadcrumb'

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
    <Layout breadcrumb={<Breadcrumb items={[{ label: 'Projects' }]} />}>
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Projects</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
          >
            + New Project
          </button>
        </div>

        <ProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={proj => {
            setProjects(curr => [proj, ...curr])
            setIsModalOpen(false)
          }}
        />

        {loading ? (
          <div className="w-full text-center py-8">Loading projects...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map(p => (
              <ProjectCard
                key={p._id}
                project={p}
                onDelete={handleDelete}
                onView={() => router.push(`/projects/${p._id}/documents`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
