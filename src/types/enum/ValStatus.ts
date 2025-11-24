export const ValStatus = {
  Draft: 1,
  InProgress: 2,
  Finalized: 3,
  Archived: 4,
} as const;

export type ValStatus = typeof ValStatus[keyof typeof ValStatus];