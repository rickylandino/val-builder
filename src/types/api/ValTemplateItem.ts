export interface ValTemplateItem {
  itemId: number;
  groupId: number | null;
  itemText: string | null;
  displayOrder: number | null;
  blankLineAfter: number | null;
  bold: boolean | null;
  bullet: boolean | null;
  center: boolean | null;
  defaultOnVal: boolean | null;
  indent: number | null;
  tightLineHeight: boolean | null;
}
