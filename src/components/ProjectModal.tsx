// src/components/ProjectModal.tsx
import { FormEvent, useState, useEffect } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Project } from '@/types/project'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: (project: Project) => void
  project?: Project | null
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSaved,
  project = null,
}: ProjectModalProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [reviewerEmails, setReviewerEmails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isEditing = project !== null

  useEffect(() => {
    if (isOpen && isEditing) {
      setName(project.name)
      setDescription(project.description)
      setContactEmail(project.contactEmail || '')
      setNotes(project.notes || '')
      setReviewerEmails(
        Array.isArray(project.reviewers)
          ? project.reviewers
              .map(r => (typeof r === 'object' ? r.email : r))
              .join(', ')
          : ''
      )
    } else {
      // Reset form when modal opens for creation or is closed
      setName('')
      setDescription('')
      setContactEmail('')
      setNotes('')
      setReviewerEmails('')
    }
  }, [isOpen, project, isEditing])

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Project name is required.')
      return
    }

    const reviewers = reviewerEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@'))

    const payload = {
      name,
      description,
      contactEmail,
      notes,
      reviewerEmails: reviewers,
    }

    setSubmitting(true)
    try {
      let response
      if (isEditing) {
        response = await api.patch<Project>(`/projects/${project._id}`, payload)
      } else {
        response = await api.post<Project>('/projects', payload)
      }
      onSaved(response.data)
      onClose()
    } catch (err: any) {
      console.error(err.response || err)
      alert(err.response?.data?.message || 'Failed to save project.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit Project' : 'New Project'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block mb-1 font-medium">Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 h-20"
            />
          </div>

          {/* Owner (read-only) */}
          <div>
            <label className="block mb-1 font-medium">Owner</label>
            <div className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700">
              {isEditing ? (project.owner as any)?.email : (user?.name || user?.email || '—')}
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block mb-1 font-medium">Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Reviewer Emails */}
          <div>
            <label className="block mb-1 font-medium">Reviewer Emails</label>
            <textarea
              value={reviewerEmails}
              onChange={e => setReviewerEmails(e.target.value)}
              placeholder="Enter reviewer emails separated by commas"
              className="w-full border rounded px-3 py-2 h-20"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter email addresses separated by commas
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block mb-1 font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border rounded px-3 py-2 h-20"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
