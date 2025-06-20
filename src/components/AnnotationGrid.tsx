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
  Table,
  Row,
  HeaderGroup,
  CellContext,
  ColumnSizingState,
} from '@tanstack/react-table'
import { AnnotatedMetaphor } from '@/types/annotatedMetaphor'
import { useAuth } from '@/context/AuthContext'
import { Domain } from '@/types/domain'

interface Props {
  projectId: string
  documentId: string
  role: 'editor' | 'reviewer'
}

interface EditedCell {
  id: string
  field: string
  oldValue: any
  newValue: any
}

interface POS {
  _id: string
  name: string
}

// Función auxiliar para comparar valores
const areValuesEqual = (a: any, b: any): boolean => {
  if (a === b) return true
  if (a === null || b === null) return a === b
  if (typeof a === 'object' && typeof b === 'object') {
    if ('_id' in a && '_id' in b) return a._id === b._id
    return JSON.stringify(a) === JSON.stringify(b)
  }
  return String(a) === String(b)
}

// Función auxiliar para formatear valores para mostrar
const formatValueForDisplay = (value: any): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    if ('name' in value) return value.name
    if (Array.isArray(value)) return value.join('; ')
    return JSON.stringify(value)
  }
  return String(value)
}

export default function AnnotationGrid({
  projectId,
  documentId,
  role,
}: Props) {
  const { user, columnPreferences, setColumnPreferences } = useAuth()
  const [editedCells, setEditedCells] = useState<EditedCell[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [domains, setDomains] = useState<Domain[]>([])
  const [posList, setPosList] = useState<POS[]>([])
  const [exportSuccess, setExportSuccess] = useState<string | null>(null)

  // data + total count (for pagination)
  const [data, setData] = useState<any[]>([])
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

  // Column visibility state
  const allColumnDefs = useMemo(() => ([
    {
      id: 'select',
      header: ({ table }: { table: Table<AnnotatedMetaphor> }) => (
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
      cell: ({ row }: { row: Row<AnnotatedMetaphor> }) => (
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
      size: 40,
    },
    { accessorKey: 'customId', header: 'ID', size: 100 },
    { accessorKey: 'expression', header: 'Expression', minSize: 200 },
    { accessorKey: 'section', header: 'Section', size: 100 },
    { accessorKey: 'subsection', header: 'Subsection', size: 100 },
    { accessorKey: 'subsection3', header: 'Subsection 3', size: 100 },
    { accessorKey: 'subsection4', header: 'Subsection 4', size: 100 },
    { accessorKey: 'subsection5', header: 'Subsection 5', size: 100 },
    { accessorKey: 'page', header: 'Page', size: 80 },
    { accessorKey: 'order', header: 'Order', size: 80 },
    { accessorKey: 'triggerWord', header: 'Trigger Word', minSize: 120 },
    { accessorKey: 'triggerWordLoc', header: 'Trigger Word Loc', minSize: 120 },
    { accessorKey: 'lemma', header: 'Lemma', minSize: 120 },
    {
      accessorFn: (row: AnnotatedMetaphor) => row.pos?.name || '',
      id: 'pos',
      header: 'POS',
      minSize: 100,
    },
    { accessorKey: 'context', header: 'Context', minSize: 400 },
    {
      accessorKey: 'contextualMeaning',
      header: 'Contextual Meaning',
      minSize: 200,
    },
    { accessorKey: 'literalMeaning', header: 'Literal Meaning', minSize: 200 },
    { accessorKey: 'conceptualMetaphor', header: 'Conceptual', minSize: 200 },
    {
      accessorFn: (row: AnnotatedMetaphor) => row.sourceDomain.name,
      id: 'sourceDomain',
      header: 'Source Domain',
      minSize: 150,
    },
    {
      accessorFn: (row: AnnotatedMetaphor) => row.targetDomain.name,
      id: 'targetDomain',
      header: 'Target Domain',
      minSize: 150,
    },
    {
      accessorKey: 'ontologicalMappings',
      header: 'Ontological Mappings',
      minSize: 200,
      cell: ({ getValue }: CellContext<AnnotatedMetaphor, any>) =>
        (getValue<string[]>() || []).join('; '),
    },
    {
      accessorKey: 'epistemicMappings',
      header: 'Epistemic Mappings',
      minSize: 200,
      cell: ({ getValue }: CellContext<AnnotatedMetaphor, any>) =>
        (getValue<string[]>() || []).join('; '),
    },
    { accessorKey: 'noveltyType', header: 'Novelty Type', size: 120 },
    { accessorKey: 'functionType', header: 'Function Type', size: 120 },
    { 
      accessorKey: 'status', 
      header: 'Status', 
      size: 120,
      cell: ({ row, getValue }: CellContext<AnnotatedMetaphor, any>) => {
        const value = getValue()
        const editedCell = editedCells.find(cell => cell.id === row.original._id && cell.field === 'status')
        const isEdited = !!editedCell
        const currentValue = editedCell ? editedCell.newValue : value

        return (
          <div className={`transition-colors duration-200 ${getEditedCellColor(isEdited)}`}>
            <select
              value={currentValue || ''}
              onChange={e => handleCellEdit(row.original._id, 'status', value, e.target.value)}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Selecciona estado</option>
              {['under_review', 'approved', 'to_edit', 'discarded', 'metonymy'].map(st => (
                <option key={st} value={st}>{st.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
        )
      }
    },
    {
      accessorKey: 'comments',
      header: 'Comments',
      cell: ({ getValue }: CellContext<AnnotatedMetaphor, any>) =>
        (getValue<string[]>() || []).join('; '),
      minSize: 200,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ getValue }: CellContext<AnnotatedMetaphor, any>) =>
        new Date(getValue<string>()).toLocaleString(),
      size: 150,
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 400,
      cell: ({ row }: { row: Row<AnnotatedMetaphor> }) => (
        <div className="flex gap-1 justify-center w-[380px]">
          {['approved', 'to_edit', 'discarded', 'metonymy'].map(st => (
            <button
              key={st}
              className="px-2 py-1 bg-primary text-white rounded text-xs hover:bg-primary-dark transition-colors whitespace-nowrap"
              onClick={() => {
                handleCellEdit(row.original._id, 'status', row.original.status, st)
                api.patch(
                  `/projects/${projectId}/documents/${documentId}/annotations/${row.original._id}`,
                  { status: st }
                ).then(() => {
                  const newPage = pagination.pageIndex
                  setPagination({ ...pagination, pageIndex: newPage })
                })
              }}
            >
              {st.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      ),
    },
  ]), [projectId, documentId, pagination.pageIndex, selected, editedCells])

  // Column visibility state (except select and actions)
  const defaultVisible = useMemo(() =>
    allColumnDefs
      .filter(col => col.id !== 'select' && col.id !== 'actions' && col.accessorKey !== undefined)
      .map(col => (col.id || col.accessorKey) as string),
    [allColumnDefs]
  )

  const PREFERENCES_KEY = `columnVisibility_doc_${documentId}`;

  const allColumnsForSelector = useMemo(() => allColumnDefs
    .filter(col => col.id !== 'select' && col.id !== 'actions')
    .map(col => ({
      id: (col.id || col.accessorKey) as string,
      label: typeof col.header === 'string' ? col.header : (col.id || col.accessorKey) as string,
    })), [allColumnDefs]);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = columnPreferences?.[PREFERENCES_KEY];
    if (Array.isArray(saved)) return saved;
    return allColumnsForSelector.map(c => c.id);
  });

  useEffect(() => {
    setVisibleColumns(() => {
      const saved = columnPreferences?.[PREFERENCES_KEY];
      if (Array.isArray(saved)) return saved;
      return allColumnsForSelector.map(c => c.id);
    });
  }, [columnPreferences, allColumnsForSelector, PREFERENCES_KEY]);

  useEffect(() => {
    setColumnPreferences({
      ...columnPreferences,
      [PREFERENCES_KEY]: visibleColumns,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleColumns]);

  const handleCellEdit = (rowId: string, field: string, originalValue: any, newValue: any) => {
    // Normalizar valores nulos o undefined
    const normalizedOriginal = originalValue ?? ''
    const normalizedNew = newValue ?? ''

    if (areValuesEqual(normalizedOriginal, normalizedNew)) {
      setEditedCells(prev => prev.filter(cell => !(cell.id === rowId && cell.field === field)))
      return
    }

    setEditedCells(prev => {
      const filtered = prev.filter(cell => !(cell.id === rowId && cell.field === field))
      return [...filtered, { 
        id: rowId, 
        field, 
        oldValue: normalizedOriginal, 
        newValue: normalizedNew 
      }]
    })
  }

  const saveChanges = async () => {
    // Group changes by row ID
    const changesByRow = editedCells.reduce((acc, cell) => {
      if (!acc[cell.id]) acc[cell.id] = {}
      acc[cell.id][cell.field] = cell.newValue
      return acc
    }, {} as Record<string, any>)

    // Save each row's changes
    for (const [id, changes] of Object.entries(changesByRow)) {
      await api.patch(
        `/projects/${projectId}/documents/${documentId}/annotations/${id}`,
        changes
      )
    }

    // Clear edited cells and refresh data
    setEditedCells([])
    const newPage = pagination.pageIndex
    setPagination({ ...pagination, pageIndex: newPage })
    setShowConfirmDialog(false)
  }

  // Función para obtener el color de fondo según el estado de edición
  const getEditedCellColor = (isEdited: boolean) => {
    return isEdited ? 'bg-yellow-100' : ''
  }

  // Función para exportar filas seleccionadas a CSV
  const exportSelectedToCSV = () => {
    if (selected.size === 0) return

    // Obtener las filas seleccionadas
    const selectedRows = data.filter(row => selected.has(row._id))
    
    // Definir las columnas que queremos exportar
    const columns = [
      'customId',
      'expression',
      'section',
      'subsection',
      'subsection3',
      'subsection4',
      'subsection5',
      'page',
      'order',
      'triggerWord',
      'triggerWordLoc',
      'lemma',
      'pos',
      'context',
      'contextualMeaning',
      'literalMeaning',
      'conceptualMetaphor',
      'sourceDomain',
      'targetDomain',
      'ontologicalMappings',
      'epistemicMappings',
      'noveltyType',
      'functionType',
      'status',
      'comments',
      'createdAt'
    ]

    // Crear el encabezado CSV
    const headers = [
      'Custom ID',
      'Expression',
      'Section',
      'Subsection',
      'Subsection 3',
      'Subsection 4',
      'Subsection 5',
      'Page',
      'Order',
      'Trigger Word',
      'Trigger Word Location',
      'Lemma',
      'POS',
      'Context',
      'Contextual Meaning',
      'Literal Meaning',
      'Conceptual Metaphor',
      'Source Domain',
      'Target Domain',
      'Ontological Mappings',
      'Epistemic Mappings',
      'Novelty Type',
      'Function Type',
      'Status',
      'Comments',
      'Created At'
    ]

    // Crear las filas de datos
    const csvRows = selectedRows.map(row => {
      return columns.map(col => {
        let value = row[col]
        
        // Manejar casos especiales
        if (col === 'pos') {
          value = typeof value === 'object' ? value.name : ''
        } else if (col === 'sourceDomain' || col === 'targetDomain') {
          value = typeof value === 'object' ? value.name : ''
        } else if (col === 'ontologicalMappings' || col === 'epistemicMappings' || col === 'comments') {
          value = Array.isArray(value) ? value.join('; ') : value
        } else if (col === 'createdAt') {
          value = value ? new Date(value).toLocaleString() : ''
        }
        
        // Escapar comillas y envolver en comillas si contiene comas o saltos de línea
        const stringValue = String(value || '')
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    })

    // Combinar encabezado y datos
    const csvContent = [headers.join(','), ...csvRows].join('\n')
    
    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `selected_metaphors_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Limpiar la selección después de exportar
    setSelected(new Set())
    
    // Mostrar mensaje de éxito (opcional - podrías usar un toast library)
    console.log(`Successfully exported ${selectedRows.length} metaphors to CSV`)
    setExportSuccess('Successfully exported metaphors to CSV')
  }

  // Fetch domains for select
  useEffect(() => {
    api.get('/domains').then(res => setDomains(res.data))
  }, [])

  // Fetch POS for select
  useEffect(() => {
    api.get(`/projects/${projectId}/documents/${documentId}/annotations/pos/all`).then(res => setPosList(res.data))
  }, [projectId, documentId])

  // Clear export success message after 3 seconds
  useEffect(() => {
    if (exportSuccess) {
      const timer = setTimeout(() => {
        setExportSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [exportSuccess])

  // fetch any time pageIndex, pageSize, sorting or filters change
  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get<{
        data: any[]
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
      // Normalizar datos
      const normalized = res.data.data.map(row => ({
        ...row,
        section: row.location?.section ?? '',
        subsection: row.location?.subsection ?? '',
        page: row.location?.page ?? '',
        sourceDomain: row.sourceDomain ?? { _id: '', name: '' },
        targetDomain: row.targetDomain ?? { _id: '', name: '' },
        comments: Array.isArray(row.comments) ? row.comments : (row.comments ? [row.comments] : []),
      }))
      setData(normalized)
      setTotal(res.data.total)
    }
    fetchData()
  }, [projectId, documentId, pagination, sorting, filters])

  // Columns to render
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const selectCol = allColumnDefs.find(col => col.id === 'select')
    const actionCol = allColumnDefs.find(col => col.id === 'actions')
    const editableCols = allColumnDefs
      .filter(col => col.id !== 'select' && col.id !== 'actions')
      .filter(col => {
        const key = (col.id || col.accessorKey) as string
        return visibleColumns.includes(key)
      })
      .map(col => ({
        ...col,
        cell: ({ row, getValue, column }: CellContext<any, any>) => {
          let colKey = column.id
          if (!colKey && column.columnDef && 'accessorKey' in column.columnDef && typeof column.columnDef.accessorKey === 'string') {
            colKey = column.columnDef.accessorKey
          }

          const originalValue = row.original[colKey]
          const editedCell = editedCells.find(cell => cell.id === row.original._id && cell.field === colKey)
          const isEdited = !!editedCell
          const currentValue = editedCell ? editedCell.newValue : originalValue

          // Campos con texto largo
          const isLongContent = [
            'expression', 
            'contextualMeaning', 
            'literalMeaning', 
            'conceptualMetaphor', 
            'comments',
            'context',
            'ontologicalMappings',
            'epistemicMappings'
          ].includes(colKey);

          if (isLongContent) {
            const isArray = Array.isArray(currentValue);
            const displayValue = isArray ? currentValue.join('\n') : currentValue;

            return (
              <div className={`transition-colors duration-200 ${getEditedCellColor(isEdited)}`}>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => {
                    const newValue = e.currentTarget.textContent;
                    if (isArray) {
                      handleCellEdit(
                        row.original._id, 
                        colKey, 
                        originalValue, 
                        newValue ? newValue.split('\n').map(s => s.trim()).filter(Boolean) : []
                      );
                    } else {
                      handleCellEdit(row.original._id, colKey, originalValue, newValue);
                    }
                  }}
                  className="w-full min-h-[24px] focus:outline-none focus:ring-1 focus:ring-primary p-1 rounded whitespace-pre-wrap break-words"
                >
                  {displayValue || ''}
                </div>
              </div>
            )
          }

          // Select para dominios
          if (colKey === 'sourceDomain' || colKey === 'targetDomain') {
            const domainId = typeof currentValue === 'object' ? currentValue._id : currentValue
            return (
              <div className={`transition-colors duration-200 ${getEditedCellColor(isEdited)}`}>
                <select
                  value={domainId || ''}
                  onChange={e => {
                    handleCellEdit(row.original._id, colKey, originalValue, e.target.value)
                  }}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Selecciona dominio</option>
                  {domains.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1 break-words">
                  {typeof currentValue === 'object' ? currentValue.name : domains.find(d => d._id === currentValue)?.name || ''}
                </div>
              </div>
            )
          }

          // Select para enums
          if (colKey === 'noveltyType' || colKey === 'functionType') {
            return (
              <div className={`transition-colors duration-200 ${getEditedCellColor(isEdited)}`}>
                <select
                  value={currentValue || ''}
                  onChange={e => handleCellEdit(row.original._id, colKey, originalValue, e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Selecciona opción</option>
                  {colKey === 'noveltyType' && ['novel/creative', 'conventional', 'lexicalized', 'fossilized'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  {colKey === 'functionType' && ['structural', 'ontological', 'orientational'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )
          }

          // Select para POS
          if (colKey === 'pos') {
            const posId = typeof currentValue === 'object' ? currentValue._id : currentValue
            return (
              <div className={`transition-colors duration-200 ${getEditedCellColor(isEdited)}`}>
                <select
                  value={posId || ''}
                  onChange={e => {
                    handleCellEdit(row.original._id, colKey, originalValue, e.target.value)
                  }}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Selecciona POS</option>
                  {posList.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1 break-words">
                  {typeof currentValue === 'object' ? currentValue.name : posList.find(p => p._id === currentValue)?.name || ''}
                </div>
              </div>
            )
          }

          // Campos de solo lectura
          if (colKey === 'customId' || colKey === 'createdAt') {
            return (
              <div className="w-full px-2 py-1 text-gray-600 bg-gray-50 rounded">
                {colKey === 'createdAt' 
                  ? new Date(currentValue).toLocaleString()
                  : currentValue || ''
                }
              </div>
            )
          }

          // Input para el resto de campos
          return (
            <div className={`transition-colors duration-200 ${getEditedCellColor(isEdited)}`}>
              <input
                type="text"
                value={currentValue || ''}
                onChange={e => handleCellEdit(row.original._id, colKey, originalValue, e.target.value)}
                className="w-full border-none focus:ring-1 focus:ring-primary bg-transparent"
              />
            </div>
          )
        },
      }))
    return [selectCol, ...editableCols, actionCol].filter(Boolean) as ColumnDef<any>[]
  }, [allColumnDefs, visibleColumns, editedCells, domains, posList])

  // build the table instance
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnSizing,
    },
    columnResizeMode: 'onChange',
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    defaultColumn: {
      minSize: 50,
      maxSize: 800,
    }
  })

  return (
    <div className="w-full">
      {/* Column Visibility Panel */}
      <div className="mb-4 p-4 border rounded-md bg-white shadow-sm">
        <h3 className="text-sm font-medium mb-2">Columnas visibles:</h3>
        <div className="flex flex-wrap gap-2">
          {allColumnDefs
            .filter(col => col.id !== 'select' && col.id !== 'actions')
            .map(col => {
              const key = (col.id || col.accessorKey) as string
              return (
                <label key={key} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(key)}
                    onChange={e => {
                      if (e.target.checked) {
                        setVisibleColumns([...visibleColumns, key])
                      } else {
                        setVisibleColumns(visibleColumns.filter(k => k !== key))
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{col.header?.toString() || key}</span>
                </label>
              )
            })}
        </div>
      </div>

      {/* Save Changes Button */}
      {editedCells.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Guardar cambios ({editedCells.length})
          </button>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
            <h3 className="text-lg font-medium mb-4">¿Confirmar cambios?</h3>
            <p className="mb-4">
              Se guardarán los siguientes cambios:
            </p>
            <div className="max-h-60 overflow-y-auto mb-4">
              {editedCells.map((cell, i) => (
                <div key={i} className="mb-2 p-2 bg-gray-50 rounded">
                  <div className="font-medium">Campo: {cell.field}</div>
                  <div className="text-red-500 line-through">
                    Antes: {formatValueForDisplay(cell.oldValue)}
                  </div>
                  <div className="text-green-500">
                    Después: {formatValueForDisplay(cell.newValue)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveChanges}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Bulk Actions */}
      <div className="flex gap-4 mb-6 flex-wrap items-center w-full">
        <input
          placeholder="Search..."
          className="border px-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-primary min-w-[200px]"
          onChange={e =>
            setFilters(f => ({ ...f, search: e.target.value }))
          }
        />
        <select
          onChange={e =>
            setFilters(f => ({ ...f, status: e.target.value }))
          }
          className="border px-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
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
          className="border px-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
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

        {selected.size > 0 && (
          <button
            className="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition ml-auto flex items-center gap-2"
            onClick={exportSelectedToCSV}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Selected ({selected.size})
          </button>
        )}
      </div>

      {/* Export Success Message */}
      {exportSuccess && (
        <div className="mb-4 p-3 border rounded-md bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700 font-medium">{exportSuccess}</p>
          </div>
        </div>
      )}

      {/* Table Container with fixed height and scroll */}
      <div className="mt-4 border rounded-lg">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <table className="border-collapse" style={{ tableLayout: 'fixed', width: table.getTotalSize() }}>
            <thead className="sticky top-0 bg-gray-50 z-10">
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<AnnotatedMetaphor>) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-2 text-center text-sm font-medium text-gray-900 border-b select-none bg-gray-50 relative group"
                      style={{ width: header.getSize() }}
                    >
                      <div className="flex items-center justify-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </div>
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className="absolute top-0 right-0 h-full w-2 cursor-col-resize bg-gray-400 opacity-0 group-hover:opacity-50 select-none touch-none"
                      />
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 group">
                  {row.getVisibleCells().map(cell => {
                    const isLongContent = cell.column.columnDef.id === 'expression' ||
                      cell.column.columnDef.id === 'contextualMeaning' ||
                      cell.column.columnDef.id === 'literalMeaning' ||
                      cell.column.columnDef.id === 'conceptualMetaphor' ||
                      cell.column.columnDef.id === 'comments';

                    return (
                      <td
                        key={cell.id}
                        className={`px-4 py-2 text-sm text-gray-900 border-b align-top group-hover:bg-gray-50`}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.columnDef.minSize,
                          maxWidth: cell.column.getSize(),
                        }}
                      >
                        <div className={`${isLongContent ? 'whitespace-pre-wrap break-words' : 'whitespace-normal'}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm w-full">
        <div className="flex items-center gap-2">
          <span>
            Page {pagination.pageIndex + 1} of{' '}
            {Math.ceil(total / pagination.pageSize)}
          </span>
          <span className="text-gray-500">
            ({total} total items)
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
