// front/src/components/AnnotationGrid.tsx
import React, { useState, useEffect, useMemo } from 'react'
import api from '@/lib/api'
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  PaginationState,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import { AnnotatedMetaphor } from '@/types/annotatedMetaphor'

interface Props {
  projectId: string
  documentId: string
  role: 'editor' | 'reviewer'
}

export default function AnnotationGrid({
  projectId,
  documentId,
  role,
}: Props) {
  // data + total count (for pagination)
  const [data, setData] = useState<AnnotatedMetaphor[]>([])
  const [total, setTotal] = useState(0)

  // server-side table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })
  const [filters, setFilters] = useState<{
    search?: string
    status?: string
    noveltyType?: string
  }>({})

  // selection
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // fetch any time pageIndex, pageSize, sorting or filters change
  useEffect(() => {
    const fetchData = async () => {
      console.log('[AnnotationGrid] fetchPage: filters=', filters, 'sorting=', sorting);
      const res = await api.get<{
        data: AnnotatedMetaphor[]
        total: number
      }>(
        `/projects/${projectId}/documents/${documentId}/annotations`,
        {
          params: {
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            search: filters.search,
            status: filters.status,
            noveltyType: filters.noveltyType,
            sortBy: sorting[0]?.id,
            sortDir: sorting[0]?.desc ? 'desc' : 'asc',
          },
        }
      )
      setData(res.data.data)
      setTotal(res.data.total)
    }
    fetchData()
  }, [projectId, documentId, pagination, sorting, filters])

  // column definitions
  const columns = useMemo<ColumnDef<AnnotatedMetaphor>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={
              table.getRowModel().rows.length > 0 &&
              Array.from(selected).length === table.getRowModel().rows.length
            }
            onChange={() => {
              const allIds = table
                .getRowModel()
                .rows.map(r => r.original._id)
              setSelected(prev => {
                if (prev.size === allIds.length) return new Set()
                return new Set(allIds)
              })
            }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selected.has(row.original._id)}
            onChange={() => {
              setSelected(prev => {
                const next = new Set(prev)
                const id = row.original._id
                next.has(id) ? next.delete(id) : next.add(id)
                return next
              })
            }}
          />
        ),
      },
      { accessorKey: 'customId', header: 'ID' },
      { accessorKey: 'expression', header: 'Expression' },
      { accessorKey: 'section', header: 'Section' },
      { accessorKey: 'subsection', header: 'Subsection' },
      { accessorKey: 'page', header: 'Page' },
      { accessorKey: 'triggerWord', header: 'Trigger Word' },
      { accessorKey: 'lemma', header: 'Lemma' },
      {
        accessorKey: 'contextualMeaning',
        header: 'Contextual Meaning',
      },
      { accessorKey: 'literalMeaning', header: 'Literal Meaning' },
      { accessorKey: 'conceptualMetaphor', header: 'Conceptual' },
      {
        accessorFn: row => row.sourceDomain.name,
        id: 'sourceDomain',
        header: 'Source Domain',
      },
      {
        accessorFn: row => row.targetDomain.name,
        id: 'targetDomain',
        header: 'Target Domain',
      },
      { accessorKey: 'noveltyType', header: 'Novelty Type' },
      { accessorKey: 'functionType', header: 'Function Type' },
      { accessorKey: 'status', header: 'Status' },
      {
        accessorKey: 'comments',
        header: 'Comments',
        cell: ({ getValue }) =>
          (getValue<string[]>() || []).join('; '),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ getValue }) =>
          new Date(getValue<string>()).toLocaleString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1">
            {['approved', 'to_edit', 'discarded', 'metonymy'].map(st => (
              <button
                key={st}
                className="px-2 py-1 bg-gray-200 rounded text-xs"
                onClick={async () => {
                  await api.patch(
                    `/projects/${projectId}/documents/${documentId}/annotations/${row.original._id}`,
                    { status: st }
                  )
                  // re-fetch
                  const newPage = pagination.pageIndex
                  setPagination({ ...pagination, pageIndex: newPage })
                }}
              >
                {st.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        ),
      },
    ],
    [projectId, documentId, pagination.pageIndex, selected]
  )

  // build the table instance
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(total / pagination.pageSize),
    manualPagination: true,
    manualSorting: true,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div>
      {/* Filters & Bulk Actions */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          placeholder="Search…"
          className="border px-2 rounded"
          onChange={e =>
            setFilters(f => ({ ...f, search: e.target.value }))
          }
        />
        <select
          onChange={e =>
            setFilters(f => ({ ...f, status: e.target.value }))
          }
          className="border px-2 rounded"
        >
          <option value="">All Status</option>
          {['under_review', 'approved', 'to_edit', 'discarded', 'metonymy'].map(
            s => (
              <option key={s} value={s}>
                {s}
              </option>
            )
          )}
        </select>
        <select
          onChange={e =>
            setFilters(f => ({ ...f, noveltyType: e.target.value }))
          }
          className="border px-2 rounded"
        >
          <option value="">All Novelty</option>
          {['novel/creative', 'conventional', 'lexicalized', 'fossilized'].map(
            o => (
              <option key={o} value={o}>
                {o}
              </option>
            )
          )}
        </select>

        {role === 'editor' && selected.size > 0 && (
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={async () => {
              await api.post(
                `/projects/${projectId}/documents/${documentId}/annotations/bulk-update`,
                {
                  ids: Array.from(selected),
                  updates: { status: 'approved' },
                }
              )
              setSelected(new Set())
              // force reload
              setPagination(p => ({ ...p, pageIndex: p.pageIndex }))
            }}
          >
            Approve Selected ({selected.size})
          </button>
        )}

        <button
          className="px-3 py-1 bg-green-600 text-white rounded"
          onClick={() =>
            window.open(
              `/projects/${projectId}/documents/${documentId}/annotations/export?` +
                new URLSearchParams({
                  ...(filters.search && { search: filters.search }),
                  ...(filters.status && { status: filters.status }),
                  ...(filters.noveltyType && { noveltyType: filters.noveltyType }),
                })
            )
          }
        >
          Export Excel
        </button>
      </div>

      {/* The Table */}
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-2 py-1 text-left text-sm"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted() as string] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              className={`${
                row.original.status === 'approved'
                  ? 'bg-green-50'
                  : ''
              }`}
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-2 py-1 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() =>
            setPagination(p => ({
              ...p,
              pageIndex: Math.max(p.pageIndex - 1, 0),
            }))
          }
          disabled={!table.getCanPreviousPage()}
          className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {pagination.pageIndex + 1} of{' '}
          {Math.max(table.getPageCount(), 1)}
        </span>
        <button
          onClick={() =>
            setPagination(p => ({
              ...p,
              pageIndex: Math.min(
                p.pageIndex + 1,
                table.getPageCount() - 1
              ),
            }))
          }
          disabled={!table.getCanNextPage()}
          className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
