/**
 * VAL Status enumeration
 */
export const ValStatus = {
  Draft: 1,
  InProgress: 2,
  Finalized: 3,
  Archived: 4,
} as const;

export type ValStatus = typeof ValStatus[keyof typeof ValStatus];

/**
 * Column types used in ValSection and ValSubItem
 */
export const ColumnType = {
  Text: 'Text',
  Number: 'Number',
  Date: 'Date',
  Currency: 'Currency',
  Percent: 'Percent',
} as const;

export type ColumnType = typeof ColumnType[keyof typeof ColumnType];

/**
 * Plan types
 */
export const PlanType = {
  Traditional401k: '401k',
  SafeHarbor401k: '401kSH',
  Profit: 'Profit',
  PensionDB: 'DB',
  Other: 'Other',
} as const;

export type PlanType = typeof PlanType[keyof typeof PlanType];
