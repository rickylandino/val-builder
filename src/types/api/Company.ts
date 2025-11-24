export interface Company {
  companyId: number;
  name: string | null;
  mailingName: string | null;
  street1: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  fax: string | null;
}

export type CreateCompany = Omit<Company, 'companyId'>;
export type UpdateCompany = Partial<Company> & Pick<Company, 'companyId'>;
export type RequiredCompanyFields = Required<Pick<Company, 'companyId'>>;
