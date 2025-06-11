// src/pages/projects/new.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '@/lib/api'
import Layout from '@/components/Layout'
import { Project } from '@/types/project'

export default function NewProjectPage() {
  const router = useRouter()
  const [form, setForm] = useState<Partial<Project>>({
    name: '',
    description: '',
    contactEmail: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      // POST to backend: http://localhost:3000/api/projects
      await api.post<Project>('/projects', form)
      router.push('/projects')
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">New Project</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 h-24"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contact Email</label>
            <input
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 h-20"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Project'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
