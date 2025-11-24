export const ColumnType = {
  Text: 'Text',
  Number: 'Number',
  Date: 'Date',
  Currency: 'Currency',
  Percent: 'Percent',
} as const;

export type ColumnType = typeof ColumnType[keyof typeof ColumnType];