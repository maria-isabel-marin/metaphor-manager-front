// src/pages/domains/relations.tsx
import { useEffect, useMemo, useState } from 'react'
import {
  FaTrash,
  FaPen,
  FaTimes,
  FaCircle,
  FaFilter,
} from 'react-icons/fa'
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

type AppliedFilters = {
  search: string
  domainA: string
  domainB: string
  relationType: '' | RelationType
  status: '' | 'active' | 'inactive'
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

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    search: '',
    domainA: '',
    domainB: '',
    relationType: '',
    status: '',
  })

  const [draftFilters, setDraftFilters] = useState<AppliedFilters>({
    search: '',
    domainA: '',
    domainB: '',
    relationType: '',
    status: '',
  })

  const fetchAll = () => {
    api.get<Domain[]>('/domains').then((res) => setDomains(res.data))
    api.get<DomainRelation[]>('/domain-relations').then((res) =>
      setRelations(res.data)
    )
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target

    setForm((prev) => ({
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

  const domainNameMap = useMemo(() => {
    return Object.fromEntries(
      domains.map((d) => [d._id, `${d.name} (${d.type})`])
    )
  }, [domains])

  const filteredRelations = useMemo(() => {
    return relations.filter((r) => {
      const domainAText = domainNameMap[r.domainA] || ''
      const domainBText = domainNameMap[r.domainB] || ''
      const relationText = r.relationType || ''
      const statusText = r.isActive === false ? 'inactive' : 'active'

      const searchText = appliedFilters.search.trim().toLowerCase()

      const matchesSearch =
        searchText === '' ||
        domainAText.toLowerCase().includes(searchText) ||
        domainBText.toLowerCase().includes(searchText) ||
        relationText.toLowerCase().includes(searchText)

      const matchesDomainA =
        appliedFilters.domainA === '' || r.domainA === appliedFilters.domainA

      const matchesDomainB =
        appliedFilters.domainB === '' || r.domainB === appliedFilters.domainB

      const matchesRelationType =
        appliedFilters.relationType === '' ||
        r.relationType === appliedFilters.relationType

      const matchesStatus =
        appliedFilters.status === '' || statusText === appliedFilters.status

      return (
        matchesSearch &&
        matchesDomainA &&
        matchesDomainB &&
        matchesRelationType &&
        matchesStatus
      )
    })
  }, [relations, domainNameMap, appliedFilters])

  const allSelected =
    filteredRelations.length > 0 &&
    filteredRelations.every((r) => selectedIds.includes(r._id))

  const toggleSelectAll = () => {
    const visibleIds = filteredRelations.map((r) => r._id)

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectedRelations = relations.filter((r) => selectedIds.includes(r._id))

  const allSelectedActive =
    selectedRelations.length > 0 &&
    selectedRelations.every((r) => r.isActive !== false)

  const allSelectedInactive =
    selectedRelations.length > 0 &&
    selectedRelations.every((r) => r.isActive === false)

  const hasMixedSelection =
    selectedRelations.length > 0 &&
    !allSelectedActive &&
    !allSelectedInactive

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
    setSelectedIds((prev) => prev.filter((id) => id !== row._id))
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
      selectedIds.map((id) => api.patch(`/domain-relations/${id}/activate`))
    )

    setSelectedIds([])
    fetchAll()
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    const ok = window.confirm(
      'Are you sure you want to delete selected relations?'
    )
    if (!ok) return

    await api.post('/domain-relations/bulk-delete', {
      ids: selectedIds,
    })
    setSelectedIds([])
    fetchAll()
  }

  const handleOpenFilters = () => {
    setDraftFilters(appliedFilters)
    setIsFilterModalOpen(true)
  }

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters)
    setSelectedIds([])
    setIsFilterModalOpen(false)
  }

  const handleCancelFilters = () => {
    setDraftFilters(appliedFilters)
    setIsFilterModalOpen(false)
  }

  const handleClearFilters = () => {
    const emptyFilters: AppliedFilters = {
      search: '',
      domainA: '',
      domainB: '',
      relationType: '',
      status: '',
    }

    setDraftFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setSelectedIds([])
    setIsFilterModalOpen(false)
  }

  const activeFiltersCount = [
    appliedFilters.search,
    appliedFilters.domainA,
    appliedFilters.domainB,
    appliedFilters.relationType,
    appliedFilters.status,
  ].filter(Boolean).length

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Semantic Domain Relations</h1>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}{' '}
              applied
            </span>
          )}

          <button
            type="button"
            title="Filters"
            onClick={handleOpenFilters}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
          >
            <FaFilter />
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-4"
      >
        <select
          name="domainA"
          value={form.domainA}
          onChange={handleChange}
          required
          className="rounded border px-3 py-2"
        >
          <option value="">Select Domain A</option>
          {domains.map((d) => (
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
          className="rounded border px-3 py-2"
        >
          <option value="">Select Domain B</option>
          {domains.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.type})
            </option>
          ))}
        </select>

        <select
          name="relationType"
          value={form.relationType}
          onChange={handleChange}
          className="rounded border px-3 py-2"
        >
          {relationTypes.map((rt) => (
            <option key={rt} value={rt}>
              {rt}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
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
            {filteredRelations.map((r) => (
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
                    className={`rounded-full px-3 py-1 text-sm ${
                      r.isActive === false
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

            {filteredRelations.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No relations found for the selected filters.
                </td>
              </tr>
            )}
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
                onChange={(e) =>
                  isBulkEdit
                    ? setBulkForm((prev) => ({
                        ...prev,
                        domainA: e.target.value,
                      }))
                    : setSingleForm((prev) => ({
                        ...prev,
                        domainA: e.target.value,
                      }))
                }
                className="rounded border px-3 py-2"
              >
                <option value="">
                  {isBulkEdit ? 'No change - Domain A' : 'Select Domain A'}
                </option>
                {domains.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.type})
                  </option>
                ))}
              </select>

              <select
                value={
                  isBulkEdit ? bulkForm.relationType : singleForm.relationType
                }
                onChange={(e) =>
                  isBulkEdit
                    ? setBulkForm((prev) => ({
                        ...prev,
                        relationType:
                          e.target.value as BulkRelationForm['relationType'],
                      }))
                    : setSingleForm((prev) => ({
                        ...prev,
                        relationType: e.target.value as RelationType,
                      }))
                }
                className="rounded border px-3 py-2"
              >
                <option value="">
                  {isBulkEdit ? 'No change - Relation' : 'Select Relation'}
                </option>
                {relationTypes.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>

              <select
                value={isBulkEdit ? bulkForm.domainB : singleForm.domainB}
                onChange={(e) =>
                  isBulkEdit
                    ? setBulkForm((prev) => ({
                        ...prev,
                        domainB: e.target.value,
                      }))
                    : setSingleForm((prev) => ({
                        ...prev,
                        domainB: e.target.value,
                      }))
                }
                className="rounded border px-3 py-2"
              >
                <option value="">
                  {isBulkEdit ? 'No change - Domain B' : 'Select Domain B'}
                </option>
                {domains.map((d) => (
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

      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">Filter relations</h2>

            <div className="grid gap-4">
              <input
                type="text"
                placeholder="Search..."
                value={draftFilters.search}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
                className="rounded border px-3 py-2"
              />

              <select
                value={draftFilters.domainA}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    domainA: e.target.value,
                  }))
                }
                className="rounded border px-3 py-2"
              >
                <option value="">All Domain A</option>
                {domains.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.type})
                  </option>
                ))}
              </select>

              <select
                value={draftFilters.relationType}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    relationType: e.target.value as AppliedFilters['relationType'],
                  }))
                }
                className="rounded border px-3 py-2"
              >
                <option value="">All Relation Types</option>
                {relationTypes.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>

              <select
                value={draftFilters.domainB}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    domainB: e.target.value,
                  }))
                }
                className="rounded border px-3 py-2"
              >
                <option value="">All Domain B</option>
                {domains.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.type})
                  </option>
                ))}
              </select>

              <select
                value={draftFilters.status}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    status: e.target.value as AppliedFilters['status'],
                  }))
                }
                className="rounded border px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-md bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
              >
                Clear filters
              </button>

              <button
                type="button"
                onClick={handleCancelFilters}
                className="rounded-md bg-gray-200 px-4 py-2"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyFilters}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}