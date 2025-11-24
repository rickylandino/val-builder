export const PlanType = {
  Traditional401k: '401k',
  SafeHarbor401k: '401kSH',
  Profit: 'Profit',
  PensionDB: 'DB',
  Other: 'Other',
} as const;

export type PlanType = typeof PlanType[keyof typeof PlanType];