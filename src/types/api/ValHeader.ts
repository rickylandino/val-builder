export interface ValHeader {
  valId: number;
  planId: number | null;
  valDescription: string | null;
  valDate: string | null; // DateTime as ISO string
  planYearBeginDate: string | null; // DateTime as ISO string
  planYearEndDate: string | null; // DateTime as ISO string
  recipientName: string | null;
  recipientAddress1: string | null;
  recipientAddress2: string | null;
  recipientCity: string | null;
  recipientState: string | null;
  recipientZip: string | null;
  finalizeDate: string | null; // DateTime as ISO string
  finalizedBy: string | null;
  wordDocPath: string | null;
  valstatusId: number | null;
  marginLeftRight: number | null;
  marginTopBottom: number | null;
  fontSize: number | null;
  valYear: number | null;
  valQuarter: number | null;
}

export type CreateValHeader = Omit<ValHeader, 'valId'>;
export type UpdateValHeader = Partial<ValHeader> & Pick<ValHeader, 'valId'>;
