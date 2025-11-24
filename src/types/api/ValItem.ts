export interface ValItem {
  itemId: number;
  valId: number | null;
  groupId: number | null;
  templateItemId: number | null;
  templateItemVersion: number | null;
  previousItemVersion: number | null;
  yellowFlag: boolean | null;
  redFlag: boolean | null;
  finalized: boolean | null;
  itemType: string | null;
  itemText: string | null;
  bulletItem: boolean | null;
  indentItem: number | null;
  centerItem: boolean | null;
  boldItem: boolean | null;
  blankLinesAfter: number | null;
  displayOrder: number | null;
  col1Width: number;
  col2Width: number;
  col3Width: number;
  col4Width: number;
}

export type CreateValItem = Omit<ValItem, 'itemId'>;
