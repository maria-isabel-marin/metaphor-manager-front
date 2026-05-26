import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

interface AnnotationsParams {
  projectId: string
  documentId: string
  page?: number
  limit?: number
  search?: string
  status?: string
  noveltyType?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

interface AnnotationsResponse {
  data: any[]
  total: number
  page: number
  limit: number
}

// Hook para obtener anotaciones con cache
export function useAnnotations(params: AnnotationsParams) {
  return useQuery({
    queryKey: ['annotations', params],
    queryFn: async (): Promise<AnnotationsResponse> => {
      const response = await api.get(`/projects/${params.projectId}/documents/${params.documentId}/annotations`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 25,
          search: params.search,
          status: params.status,
          noveltyType: params.noveltyType,
          sortBy: params.sortBy,
          sortDir: params.sortDir,
        },
      })
      
      // Normalizar datos
      const normalized = response.data.data.map((row: any) => ({
        ...row,
        section: row.location?.section ?? '',
        subsection: row.location?.subsection ?? '',
        page: row.location?.page ?? '',
        sourceDomain: row.sourceDomain ?? { _id: '', name: '' },
        targetDomain: row.targetDomain ?? { _id: '', name: '' },
        comments: Array.isArray(row.comments) ? row.comments : (row.comments ? [row.comments] : []),
      }))
      
      return {
        ...response.data,
        data: normalized,
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

// Hook para actualizar una anotación
export function useUpdateAnnotation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await api.patch(`/annotated-metaphors/${id}`, updates)
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidar cache de anotaciones para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['annotations'] })
    },
  })
}

// Hook para actualización masiva
export function useBulkUpdateAnnotations() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: any }) => {
      const response = await api.post('/annotated-metaphors/bulk-update', { ids, updates })
      return response.data
    },
    onSuccess: () => {
      // Invalidar cache de anotaciones
      queryClient.invalidateQueries({ queryKey: ['annotations'] })
    },
  })
}

// Hook para exportar anotaciones
export function useExportAnnotations() {
  return useMutation({
    mutationFn: async ({ projectId, documentId, options }: { 
      projectId: string; 
      documentId: string; 
      options?: any 
    }) => {
      const response = await api.get(`/projects/${projectId}/documents/${documentId}/annotations/export`, {
        params: options,
        responseType: 'blob',
      })
      return response.data
    },
  })
} 