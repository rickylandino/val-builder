export interface ValAnnotation {
  annotationId: number;
  author: string | null;
  authorId: string | null;
  annotationContent: string | null;
  annotationGroupId: string | null; // Guid as UUID string
  dateModified: string | null; // DateTime as ISO string
  valId: number | null;
  groupId: number | null;
}
