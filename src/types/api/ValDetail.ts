export interface ValDetail {
  valDetailsId: string; // GUID - camelCase to match API
  valId: number;
  groupId: number;
  groupContent: string;
  displayOrder: number;
  bullet: boolean; // API returns boolean
  indent: number | null;
  bold: boolean; // API returns boolean
  center: boolean; // API returns boolean
  blankLineAfter: number | null;
  tightLineHeight: boolean; // API returns boolean
}

export type CreateValDetail = Omit<ValDetail, 'valDetailsId'>;
export type UpdateValDetail = Partial<ValDetail> & Pick<ValDetail, 'valDetailsId'>;