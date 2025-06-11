// src/types/domain.ts

export type DomainType = 'source' | 'target' | 'both'

export interface Domain {
  _id: string
  name: string
  type: DomainType
  createdAt: string
  updatedAt: string
}
