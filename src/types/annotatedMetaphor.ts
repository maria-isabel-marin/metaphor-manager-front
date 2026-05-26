// src/types/annotatedMetaphor.ts
export type NoveltyType = 'novel/creative' | 'conventional' | 'lexicalized' | 'fossilized';
export type FunctionType = 'structural' | 'ontological' | 'orientational';
export type MetaphorStatus = 'under_review' | 'approved' | 'to_edit' | 'discarded' | 'metonymy';

export interface Domain {
  _id: string;
  name: string;
}

export interface POS {
  _id: string;
  name: string;
}

export interface AnnotatedMetaphor {
  _id: string;
  customId: string;
  documentId: string;
  expression: string;
  section?: string;
  subsection?: string;
  subsection3?: string;
  subsection4?: string;
  subsection5?: string;
  page?: string;
  order?: string;
  triggerWord: string;
  triggerWordLoc?: string;
  lemma: string;
  pos?: POS;
  context: string;
  literalMeaning: string;
  contextualMeaning: string;
  sourceDomain: Domain;
  targetDomain: Domain;
  conceptualMetaphor: string;
  ontologicalMappings: string[];
  epistemicMappings: string[];
  noveltyType: NoveltyType;
  functionType: FunctionType;
  status: MetaphorStatus;
  comments: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
