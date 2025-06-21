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
import { PlusIcon } from '@heroicons/react/24/solid'
import AboutModal from '@/components/AboutModal'

interface ProjectsResponse {
  owned: Project[];
  reviewing: Project[];
}

export default function ProjectsIndexPage() {
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([])
  const [reviewingProjects, setReviewingProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const { logout } = useAuth()
  const router = useRouter()
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    // Check if the user has seen the about modal before
    const hasSeenModal = localStorage.getItem('hasSeenAboutModal')
    if (!hasSeenModal) {
      setIsNewUser(true)
    }
  }, [])

  const handleCloseAboutModal = () => {
    localStorage.setItem('hasSeenAboutModal', 'true')
    setIsNewUser(false)
  }

  const loadProjects = useCallback(() => {
    setLoading(true)
    api.get<ProjectsResponse>('/projects')
      .then(res => {
        setOwnedProjects(res.data.owned)
        setReviewingProjects(res.data.reviewing)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProject(null)
  }

  const handleSaveProject = (savedProject: Project) => {
    if (editingProject) {
      // Update existing project
      setOwnedProjects(prev => prev.map(p => p._id === savedProject._id ? savedProject : p))
    } else {
      // Add new project
      setOwnedProjects(prev => [savedProject, ...prev])
    }
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    api.delete(`/projects/${id}`).then(() =>
      setOwnedProjects(curr => curr.filter(p => p._id !== id))
    )
  }

  const renderProjectsSection = (title: string, projects: Project[], isReviewer = false) => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <ProjectCard
            key={p._id}
            project={p}
            onDelete={!isReviewer ? handleDelete : undefined}
            onEdit={!isReviewer ? () => handleOpenEditModal(p) : undefined}
            onView={() => router.push(`/projects/${p._id}/documents`)}
            isReviewer={isReviewer}
          />
        ))}
      </div>
    </div>
  )

  return (
    <Layout breadcrumb={<Breadcrumb items={[{ label: 'Projects' }]} />}>
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Projects</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
          >
            + New Project
          </button>
        </div>

        <ProjectModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSaved={handleSaveProject}
          project={editingProject}
        />

        <AboutModal isOpen={isNewUser} onClose={handleCloseAboutModal} />

        {loading ? (
          <div className="w-full text-center py-8">Loading projects...</div>
        ) : (
          <div className="space-y-8">
            {ownedProjects.length > 0 && renderProjectsSection('Your Projects', ownedProjects)}
            {reviewingProjects.length > 0 && renderProjectsSection('Projects You Review', reviewingProjects, true)}
            {ownedProjects.length === 0 && reviewingProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No projects found. Create one to get started!
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
