export interface ValDetail {
  valDetailsId: string | null; // Guid as UUID string
  valId: number | null;
  groupId: number | null;
  groupContent: string | null;
  displayOrder: number | null;
  bullet: boolean | null;
  indent: number | null;
  bold: boolean | null;
  center: boolean | null;
  blankLineAfter: number | null;
  tightLineHeight: boolean | null;
}
