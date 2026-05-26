// src/types/project.ts

interface User {
  _id: string;
  email: string;
  name?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: string | User;  // Can be either user ID or populated user object
  reviewers: User[];     // Array of reviewer users
  contactEmail: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
