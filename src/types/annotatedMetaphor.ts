// src/types/annotatedMetaphor.ts
export type NoveltyType = 'novel/creative' | 'conventional' | 'lexicalized' | 'fossilized';
export type FunctionType = 'structural' | 'ontological' | 'orientational';
export type MetaphorStatus = 'under_review' | 'approved' | 'to_edit' | 'discarded' | 'metonymy';

export interface Location {
  section: string;
  subsection: string;
  page: string;
}

export interface AnnotatedMetaphor {
  _id: string;
  customId: string;
  documentId: string;
  expression: string;
  location: Location;
  triggerWord: string;
  lemma: string;
  context: string;
  literalMeaning: string;
  contextualMeaning: string;
  sourceDomain: string;
  targetDomain: string;
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
