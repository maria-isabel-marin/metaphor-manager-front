// src/components/ProjectModal.tsx
import { FormEvent, useState } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Project } from '@/types/project'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (project: Project) => void
}

export default function ProjectModal({
  isOpen,
  onClose,
  onCreated,
}: ProjectModalProps) {
  const { user } = useAuth()                  // trae { id, name, email }
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !contactEmail.trim()) {
      alert('Name and Contact Email are required.')
      return
    }
    setSubmitting(true)
    try {
      // **AHORA** enviamos el mismo body que el form de NewProjectPage,
      // + la propiedad "responsible" con user.name
      const { data } = await api.post<Project>('/projects', {
        name,
        description,
        contactEmail,
        notes,
        responsible: user?.name ?? user?.email, 
      })
      onCreated(data)
      onClose()
    } catch (err: any) {
      console.error(err.response || err)
      alert(err.response?.data?.message || 'Failed to create project.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">New Project</h2>
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
              {user?.name || user?.email || '—'}
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block mb-1 font-medium">Contact Email *</label>
            <input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
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
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
