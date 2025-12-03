import type { ValHeader } from './ValHeader';
import type { CompanyPlan } from './CompanyPlan';

// Define all available objects and their fields for bracket mapping
export const BRACKET_MAPPING_FIELDS = {
  valHeader: {
    label: 'VAL Header',
    fields: [
      { path: 'valHeader.valDescription', label: 'VAL Description' },
      { path: 'valHeader.planYearBeginDate', label: 'Plan Year Begin Date' },
      { path: 'valHeader.planYearEndDate', label: 'Plan Year End Date' },
      { path: 'valHeader.recipientName', label: 'Recipient Name' },
      { path: 'valHeader.recipientAddress1', label: 'Recipient Address 1' },
      { path: 'valHeader.recipientAddress2', label: 'Recipient Address 2' },
      { path: 'valHeader.recipientCity', label: 'Recipient City' },
      { path: 'valHeader.recipientState', label: 'Recipient State' },
      { path: 'valHeader.recipientZip', label: 'Recipient Zip' },
      { path: 'valHeader.valYear', label: 'VAL Year' },
      { path: 'valHeader.valQuarter', label: 'VAL Quarter' },
    ],
  },
  companyPlan: {
    label: 'Company Plan',
    fields: [
      { path: 'companyPlan.planName', label: 'Plan Name' },
      { path: 'companyPlan.planType', label: 'Plan Type' },
      { path: 'companyPlan.planYearEnd', label: 'Plan Year End' },
      { path: 'companyPlan.tech', label: 'Tech' },
    ],
  }
} as const;

// Flatten all fields for easy dropdown rendering
export const ALL_BRACKET_MAPPING_FIELDS = Object.values(BRACKET_MAPPING_FIELDS).flatMap(
    //@ts-ignore
    group => group.fields
);

// Type for replacement context
export type BracketReplaceContext = {
  valHeader: ValHeader;
  companyPlan: CompanyPlan;
};
