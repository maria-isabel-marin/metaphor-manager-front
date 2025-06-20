// src/components/DocumentModal.tsx
import { FormEvent, useState, useEffect } from 'react'
import api from '@/lib/api'
import { Document } from '@/types/document'

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: (document: Document) => void
  projectId: string
  document?: Document // Optional for edit mode
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
  isOpen,
  onClose,
  onSaved,
  projectId,
  document,
}: DocumentModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [language, setLanguage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Load document data when editing
  useEffect(() => {
    if (document) {
      setTitle(document.title)
      setDescription(document.description || '')
      setType(document.type)
      setLanguage(document.language)
      setFile(null)
    } else {
      // Reset form when creating new
      setTitle('')
      setDescription('')
      setType('')
      setLanguage('')
      setFile(null)
    }
    setErrors({})
  }, [document, isOpen]) // Depend on isOpen to reset form correctly

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!type.trim()) {
      newErrors.type = 'Type is required'
    }
    
    if (!language.trim()) {
      newErrors.language = 'Language is required'
    }
    
    if (!document && !file) {
      newErrors.file = 'File is required for new documents'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSubmitting(true)

    try {
      let response
      if (document) {
        // UPDATE (FormData to support file upload)
        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('type', type)
        formData.append('language', language)
        if (file) {
          formData.append('file', file)
        }
        
        response = await api.patch<Document>(`/documents/${document._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // CREATE (FormData)
        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('type', type)
        formData.append('language', language)
        formData.append('projectId', projectId)
        if (file) {
          formData.append('file', file)
        }
        response = await api.post<Document>('/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSaved(response.data)
      onClose()
    } catch (err: any) {
      console.error(err.response || err)
      alert(err.response?.data?.message || 'Failed to save document.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {document ? 'Edit Document' : 'New Document'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block mb-1 font-medium">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`w-full border rounded px-3 py-2 ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
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

          {/* Type */}
          <div>
            <label className="block mb-1 font-medium">Type *</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className={`w-full border rounded px-3 py-2 ${errors.type ? 'border-red-500' : ''}`}
            >
              <option value="">Select type...</option>
              {TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          {/* Language */}
          <div>
            <label className="block mb-1 font-medium">Language *</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className={`w-full border rounded px-3 py-2 ${errors.language ? 'border-red-500' : ''}`}
            >
              <option value="">Select language...</option>
              {LANGUAGE_OPTIONS.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language}</p>}
          </div>

          {/* File upload */}
          <div>
            <label className="block mb-1 font-medium">
              File {!document ? '*' : ''} (PDF or TXT)
            </label>
            <input
              type="file"
              onChange={e => setFile(e.target.files?.[0] || null)}
              accept=".txt,.pdf"
              className={`w-full border rounded px-3 py-2 ${errors.file ? 'border-red-500' : ''}`}
            />
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
            {document && (
              <p className="text-gray-500 text-sm mt-1">
                Leave empty to keep current file: {document.fileType || 'Unknown type'}
              </p>
            )}
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
