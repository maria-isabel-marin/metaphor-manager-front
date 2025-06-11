// src/types/project.ts
export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: string;         // user ID
  contactEmail: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
