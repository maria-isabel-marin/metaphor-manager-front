// src/types/document.ts
export type DocumentStatus = 'draft' | 'in_review' | 'reviewed' | 'published';

// front/src/types/document.ts
export interface Document {
  _id: string
  projectId: string
  createdBy: string

  title: string
  description?: string
  type: string
  language: string
  notes?: string

  // rutas en GCS (opcional guardar si lo usas)
  gcsPathPdf?: string
  gcsPathTxt?: string

  // URLs firmadas para descarga
  filePdfUrl?: string
  fileTxtUrl?: string

  status: DocumentStatus
  createdAt: string
  updatedAt: string
}
