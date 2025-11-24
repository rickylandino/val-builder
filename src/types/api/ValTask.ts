export interface ValTask {
  taskId: number;
  author: string | null;
  authorId: string | null;
  taskContent: string | null;
  dateModified: string | null; // DateTime as ISO string
  valId: number | null;
  groupId: number | null;
  completed: boolean | null;
}
