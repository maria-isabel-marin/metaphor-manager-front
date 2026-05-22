// src/pages/domains/relations.tsx
import { useEffect, useMemo, useState } from 'react'
import { FaTrash, FaPen, FaTimes, FaCircle } from 'react-icons/fa'
import api from '@/lib/api'
import { Domain } from '@/types/domain'
import { DomainRelation } from '@/types/domainRelation'

const relationTypes = [
  'hypernym',
  'hyponym',
  'co-hyponym',
  'meronym',
  'holonym',
  'syntagmatic',
] as const

type RelationType = (typeof relationTypes)[number]

type RelationForm = {
  domainA: string
  domainB: string
  relationType: RelationType
}

type BulkRelationForm = {
  domainA: string
  domainB: string
  relationType: '' | RelationType
}

export default function RelationsPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [relations, setRelations] = useState<DomainRelation[]>([])

  const [form, setForm] = useState<RelationForm>({
    domainA: '',
    domainB: '',
    relationType: relationTypes[0],
  })

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBulkEdit, setIsBulkEdit] = useState(false)

  const [editingRow, setEditingRow] = useState<DomainRelation | null>(null)

  const [singleForm, setSingleForm] = useState<RelationForm>({
    domainA: '',
    domainB: '',
    relationType: relationTypes[0],
  })

  const [bulkForm, setBulkForm] = useState<BulkRelationForm>({
    domainA: '',
    domainB: '',
    relationType: '',
  })

  const fetchAll = () => {
    api.get<Domain[]>('/domains').then(res => setDomains(res.data))
    api.get<DomainRelation[]>('/domain-relations').then(res => setRelations(res.data))
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: name === 'relationType' ? (value as RelationType) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    api.post('/domain-relations', form).then(() => {
      setForm({
        domainA: '',
        domainB: '',
        relationType: relationTypes[0],
      })
      fetchAll()
    })
  }

  const allSelected =
    relations.length > 0 && selectedIds.length === relations.length

  const selectedRelations = relations.filter(r => selectedIds.includes(r._id))

  const allSelectedActive =
    selectedRelations.length > 0 &&
    selectedRelations.every(r => r.isActive !== false)

  const allSelectedInactive =
    selectedRelations.length > 0 &&
    selectedRelations.every(r => r.isActive === false)

  const hasMixedSelection =
    selectedRelations.length > 0 &&
    !allSelectedActive &&
    !allSelectedInactive

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(relations.map(r => r._id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleEditRow = (row: DomainRelation) => {
    setIsBulkEdit(false)
    setEditingRow(row)
    setSingleForm({
      domainA: row.domainA,
      domainB: row.domainB,
      relationType: row.relationType,
    })
    setIsEditModalOpen(true)
  }

  const handleOpenBulkEdit = () => {
    if (selectedIds.length === 0) return
    setIsBulkEdit(true)
    setEditingRow(null)
    setBulkForm({
      domainA: '',
      domainB: '',
      relationType: '',
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (isBulkEdit) {
      const data: Partial<RelationForm> = {}

      if (bulkForm.domainA) data.domainA = bulkForm.domainA
      if (bulkForm.domainB) data.domainB = bulkForm.domainB
      if (bulkForm.relationType) data.relationType = bulkForm.relationType

      if (Object.keys(data).length === 0) {
        setIsEditModalOpen(false)
        return
      }

      await api.patch('/domain-relations/bulk-update', {
        ids: selectedIds,
        data,
      })
    } else if (editingRow) {
      await api.patch(`/domain-relations/${editingRow._id}`, singleForm)
    }

    setIsEditModalOpen(false)
    setEditingRow(null)
    setSelectedIds([])
    fetchAll()
  }

  const handleDeactivateRow = async (row: DomainRelation) => {
    await api.patch(`/domain-relations/${row._id}/deactivate`)
    fetchAll()
  }

  const handleActivateRow = async (row: DomainRelation) => {
    await api.patch(`/domain-relations/${row._id}/activate`)
    fetchAll()
  }

  const handleDeleteRow = async (row: DomainRelation) => {
    const ok = window.confirm('Are you sure you want to delete this relation?')
    if (!ok) return

    await api.delete(`/domain-relations/${row._id}`)
    setSelectedIds(prev => prev.filter(id => id !== row._id))
    fetchAll()
  }

  const handleBulkDeactivate = async () => {
    if (selectedIds.length === 0) return
    await api.patch('/domain-relations/bulk-deactivate', {
      ids: selectedIds,
    })
    setSelectedIds([])
    fetchAll()
  }

  const handleBulkActivate = async () => {
    if (selectedIds.length === 0) return

    await Promise.all(
      selectedIds.map(id => api.patch(`/domain-relations/${id}/activate`))
    )

    setSelectedIds([])
    fetchAll()
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    const ok = window.confirm('Are you sure you want to delete selected relations?')
    if (!ok) return

    await api.post('/domain-relations/bulk-delete', {
      ids: selectedIds,
    })
    setSelectedIds([])
    fetchAll()
  }

  const domainNameMap = useMemo(() => {
    return Object.fromEntries(domains.map(d => [d._id, `${d.name} (${d.type})`]))
  }, [domains])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Semantic Domain Relations</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <select
          name="domainA"
          value={form.domainA}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        >
          <option value="">Select Domain A</option>
          {domains.map(d => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.type})
            </option>
          ))}
        </select>

        <select
          name="domainB"
          value={form.domainB}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        >
          <option value="">Select Domain B</option>
          {domains.map(d => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.type})
            </option>
          ))}
        </select>

        <select
          name="relationType"
          value={form.relationType}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        >
          {relationTypes.map(rt => (
            <option key={rt} value={rt}>
              {rt}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          Add Relation
        </button>
      </form>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm">
          <span className="text-sm font-medium">
            {selectedIds.length} selected
          </span>

          <button
            type="button"
            onClick={handleOpenBulkEdit}
            className="rounded-md bg-blue-600 px-3 py-2 text-white"
          >
            Edit selected
          </button>

          {(allSelectedActive || hasMixedSelection) && (
            <button
              type="button"
              onClick={handleBulkDeactivate}
              className="rounded-md bg-yellow-600 px-3 py-2 text-white"
            >
              Deactivate selected
            </button>
          )}

          {(allSelectedInactive || hasMixedSelection) && (
            <button
              type="button"
              onClick={handleBulkActivate}
              className="rounded-md bg-sky-600 px-3 py-2 text-white"
            >
              Activate selected
            </button>
          )}

          <button
            type="button"
            onClick={handleBulkDelete}
            className="rounded-md bg-red-600 px-3 py-2 text-white"
          >
            Delete selected
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full overflow-hidden rounded-lg bg-white shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-2 text-left">Domain A</th>
              <th className="px-4 py-2 text-left">Relation</th>
              <th className="px-4 py-2 text-left">Domain B</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {relations.map(r => (
              <tr key={r._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r._id)}
                    onChange={() => toggleSelectOne(r._id)}
                  />
                </td>

                <td className="px-4 py-2">{domainNameMap[r.domainA] || '—'}</td>
                <td className="px-4 py-2 capitalize">{r.relationType}</td>
                <td className="px-4 py-2">{domainNameMap[r.domainB] || '—'}</td>

                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${r.isActive === false
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-green-100 text-green-700'
                      }`}
                  >
                    {r.isActive === false ? 'Inactive' : 'Active'}
                  </span>
                </td>

                <td className="px-4 py-2">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => handleEditRow(r)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaPen />
                    </button>

                    {r.isActive === false ? (
                      <button
                        type="button"
                        title="Activate"
                        onClick={() => handleActivateRow(r)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaCircle />
                      </button>
                    ) : (
                      <button
                        type="button"
                        title="Deactivate"
                        onClick={() => handleDeactivateRow(r)}
                        className="text-gray-700 hover:text-black"
                      >
                        <FaTimes />
                      </button>
                    )}

                    <button
                      type="button"
                      title="Delete"
                      onClick={() => handleDeleteRow(r)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">
              {isBulkEdit ? 'Edit selected relations' : 'Edit relation'}
            </h2>

            <div className="grid gap-4">
              <select
                value={isBulkEdit ? bulkForm.domainA : singleForm.domainA}
                onChange={e =>
                  isBulkEdit
                    ? setBulkForm(prev => ({ ...prev, domainA: e.target.value }))
                    : setSingleForm(prev => ({ ...prev, domainA: e.target.value }))
                }
                className="border rounded px-3 py-2"
              >
                <option value="">
                  {isBulkEdit ? 'No change - Domain A' : 'Select Domain A'}
                </option>
                {domains.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.type})
                  </option>
                ))}
              </select>

              <select
                value={isBulkEdit ? bulkForm.relationType : singleForm.relationType}
                onChange={e =>
                  isBulkEdit
                    ? setBulkForm(prev => ({
                      ...prev,
                      relationType: e.target.value as BulkRelationForm['relationType'],
                    }))
                    : setSingleForm(prev => ({
                      ...prev,
                      relationType: e.target.value as RelationType,
                    }))
                }
                className="border rounded px-3 py-2"
              >
                <option value="">
                  {isBulkEdit ? 'No change - Relation' : 'Select Relation'}
                </option>
                {relationTypes.map(rt => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>

              <select
                value={isBulkEdit ? bulkForm.domainB : singleForm.domainB}
                onChange={e =>
                  isBulkEdit
                    ? setBulkForm(prev => ({ ...prev, domainB: e.target.value }))
                    : setSingleForm(prev => ({ ...prev, domainB: e.target.value }))
                }
                className="border rounded px-3 py-2"
              >
                <option value="">
                  {isBulkEdit ? 'No change - Domain B' : 'Select Domain B'}
                </option>
                {domains.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingRow(null)
                }}
                className="rounded-md bg-gray-200 px-4 py-2"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-md bg-blue-600 px-4 py-2 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}