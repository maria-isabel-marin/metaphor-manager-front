// src/types/domainRelation.ts

export type RelationType =
  | 'hypernym'
  | 'hyponym'
  | 'co-hyponym'
  | 'meronym'
  | 'holonym'
  | 'syntagmatic'

export interface DomainRelation {
  _id: string
  domainA: string    // ID of source domain
  domainB: string    // ID of target domain
  relationType: RelationType
  isActive?: boolean // Valition is active
  createdAt: string
  updatedAt: string
}
