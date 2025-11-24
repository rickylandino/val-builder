export interface ValSubItem {
  subItemId: number;
  parentItemId: number | null;
  valId: number | null;
  templateItemId: number | null;
  templateItemVersion: number | null;
  previousItemVersion: number | null;
  yellowFlag: boolean | null;
  redFlag: boolean | null;
  finalized: boolean | null;
  col1Value: string | null;
  col2Value: string | null;
  col3Value: string | null;
  col4Value: string | null;
  col1Type: string | null;
  col2Type: string | null;
  col3Type: string | null;
  col4Type: string | null;
  displayOrder: number | null;
}
