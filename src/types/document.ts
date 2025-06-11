// src/types/document.ts
export type DocumentStatus = 'draft' | 'published';

export interface Document {
  _id: string;
  projectId: string;
  title: string;
  type: string;
  language: string;
  notes?: string;
  status: DocumentStatus;
  filePdf: string;
  fileTxt: string;
  createdAt: string;
  updatedAt: string;
}
