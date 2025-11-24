export interface ValSubContentItem {
  itemId: number;
  subContentId: number | null;
  itemContent: string | null;
  displayOrder: number | null;
  contributionType: string | null;
  contributionAmount: string | null;
  class: string | null;
  group: string | null;
  participant: string | null;
  excessContributionAmount: string | null;
  earnings: string | null;
  dateOfTermination: string | null; // DateTime as ISO string
  vestedPercent: string | null;
  vestedBalance: string | null;
  isAdp: boolean | null;
  isAcp: boolean | null;
  dateOfEntry: string | null; // DateTime as ISO string
  dateOfBirth: string | null; // DateTime as ISO string
  dateOfHire: string | null; // DateTime as ISO string
}
