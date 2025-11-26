import { CompanyPlanSelect } from '@/components/plans/CompanyPlanSelect';
import { CreateCompanyPlanDialog } from '@/components/plans/CreateCompanyPlanDialog';
import { useState } from 'react';
import { useCompanies } from '@/hooks/api/useCompanies';
import { FileText, Building2 } from 'lucide-react';
import { CreateCompanyDialog } from '@/components/companies/CreateCompanyDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


import { ValHeadersTable } from '@/components/vals/ValHeadersTable';
import { useValHeaders } from '@/hooks/api/useValHeaders';
import { CreateValDialog } from '@/components/vals/CreateValDialog';

export const LandingPage = () => {
  const { data: companies, isLoading, error } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('2');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('4');

  // Convert selectedCompanyId to number for API call
  const selectedCompanyIdNum = selectedCompanyId === 'all' ? null : Number(selectedCompanyId);
  const selectedPlanIdNum = selectedPlanId === 'all' ? null : Number(selectedPlanId);
  const { data: valHeaders = [], isLoading: isValLoading, error: valError } =
    useValHeaders(selectedPlanIdNum);



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading companies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">
          Error loading companies: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-secondary)] via-[var(--color-muted)] to-[var(--color-secondary)]">
      {/* Header */}
      <header className="bg-[var(--color-primary)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-primary)]/60 border-b border-[var(--color-border)] sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary-foreground)]/10 rounded-lg">
              <FileText className="h-6 w-6 text-[var(--color-primary-foreground)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--color-primary-foreground)]">
                VAL Builder
              </h1>
              <p className="text-[var(--color-secondary)] text-sm">
                Manage your valuation letters
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Company & Plan Selection */}
        <div className="bg-[var(--color-background)]/80 backdrop-blur rounded-xl border border-[var(--color-border)] p-6 shadow-lg shadow-black/5 space-y-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--color-primary)]" />
              <label htmlFor="company-select" className="text-sm font-semibold text-[var(--color-primary)]">
                Filter by Company
              </label>
            </div>
            <CreateCompanyDialog />
          </div>
          <Select value={selectedCompanyId} onValueChange={val => { setSelectedCompanyId(val); setSelectedPlanId('none'); }}>
            <SelectTrigger id="company-select" className="w-full max-w-md">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">All Companies</SelectItem>
              {companies?.map((company) => (
                <SelectItem key={company.companyId} value={company.companyId.toString()}>
                  {company.name || `Company ${company.companyId}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Company Plan Selection (scoped by company) */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[var(--color-primary)]" />
              <label htmlFor="plan-select" className="text-sm font-semibold text-[var(--color-primary)]">
                Filter by Company Plan
              </label>
            </div>
            <CreateCompanyPlanDialog companyId={selectedCompanyIdNum} onCreated={() => {}} />
          </div>
          <CompanyPlanSelect
            companyId={selectedCompanyIdNum}
            value={selectedPlanId}
            onChange={setSelectedPlanId}
          />
        </div>

        {/* VAL Headers Table */}
        <div className="bg-[var(--color-background)]/80 backdrop-blur rounded-xl border border-[var(--color-border)] shadow-lg shadow-black/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-secondary)]/30">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Valuation Letters
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {isValLoading
                  ? 'Loading...'
                  : (() => {
                      const count = valHeaders.length;
                      const plural = count === 1 ? '' : 's';
                      return `${count} letter${plural} found`;
                    })()}
              </p>
            </div>
            <CreateValDialog planId={selectedPlanIdNum} onCreated={() => {}} />
          </div>
          {valError ? (
            <div className="p-6 text-red-600">
              Error loading valuation letters: {valError.message}
            </div>
          ) : (
            <ValHeadersTable valHeaders={valHeaders} />
          )}
        </div>
      </main>
    </div>
  );
};
