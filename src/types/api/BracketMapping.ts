export interface BracketMapping {
  id: number;
  tagName: string;
  objectPath: string;
  description: string | null;
  systemTag?: boolean | null;
}

export type CreateBracketMapping = Omit<BracketMapping, 'id'>;
export type UpdateBracketMapping = Partial<BracketMapping> & Pick<BracketMapping, 'id'>;
