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

  // New unified file path
  gcsPath?: string
  fileType?: string

  // Legacy fields for backward compatibility
  gcsPathPdf?: string
  gcsPathTxt?: string

  // URLs firmadas para descarga
  fileUrl?: string

  status: DocumentStatus
  createdAt: string
  updatedAt: string
}
