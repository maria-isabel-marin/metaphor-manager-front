// src/components/DocumentModal.tsx
import { useState, ChangeEvent, FormEvent } from 'react'
import api from '@/lib/api'

interface DocumentModalProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

const TYPE_OPTIONS = [
  'Fiction (Literary Texts)',
  'Non-Fiction (Informative & Analytical Texts)',
  'Legal & Policy Texts',
  'Media & Journalism',
  'Academic & Educational Texts',
  'Religious & Spiritual Texts',
  'Advertising & Commercial Texts',
  'Human Rights Reports',
  'Literary Non-Fiction / Testimonial Literature',
  'Cultural & Artistic Texts',
  'Other',
]

const LANGUAGE_OPTIONS = ['English', 'Spanish']

export default function DocumentModal({
  projectId,
  isOpen,
  onClose,
  onCreated,
}: DocumentModalProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('')
  const [language, setLanguage] = useState('')
  const [notes, setNotes] = useState('')
  const [filePdf, setFilePdf] = useState<File | null>(null)
  const [fileTxt, setFileTxt] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  if (!isOpen) return null

  const validate = (): boolean => {
    if (!title.trim() || !type || !language) {
      alert('Title, Type and Language are required.')
      return false
    }
    if ((filePdf && fileTxt) || (!filePdf && !fileTxt)) {
      setFileError('Please upload exactly one file: either PDF or TXT.')
      return false
    }
    setFileError(null)
    return true
  }

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilePdf(e.target.files?.[0] || null)
  }

  const handleTxtChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileTxt(e.target.files?.[0] || null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('type', type)
    formData.append('language', language)
    formData.append('notes', notes)
    if (filePdf) formData.append('filePdf', filePdf)
    if (fileTxt) formData.append('fileTxt', fileTxt)

    try {
      await api.post(`/projects/${projectId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      alert('Document uploaded successfully.')
      onCreated()
      onClose()
    } catch (err) {
      console.error(err)
      alert('Error saving document. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">New Document</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block mb-1 font-medium">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block mb-1 font-medium">Type *</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="">Select type…</option>
              {TYPE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block mb-1 font-medium">Language *</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="">Select language…</option>
              {LANGUAGE_OPTIONS.map(lang => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
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

          {/* File Inputs */}
          <div>
            <label className="block mb-1 font-medium">PDF File</label>
            <input type="file" accept=".pdf" onChange={handlePdfChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium">TXT File</label>
            <input type="file" accept=".txt" onChange={handleTxtChange} />
          </div>
          {fileError && <p className="text-red-600">{fileError}</p>}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
