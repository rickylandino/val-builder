export interface CompanyPlan {
  planId: number;
  companyId: number | null;
  planType: string | null;
  planName: string | null;
  planYearEnd: string | null;
  tech: string | null;
}
