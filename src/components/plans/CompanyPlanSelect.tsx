import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanyPlans } from '@/hooks/api/useCompanyPlans';
import type { CompanyPlan } from '@/types/api';

export function CompanyPlanSelect({ companyId, value, onChange }: Readonly<{
  companyId: number | null;
  value: string;
  onChange: (val: string) => void;
}>) {
  const { data, isLoading } = useCompanyPlans(companyId);
  const plans = Array.isArray(data) ? data : [];

  return (
    <Select value={value} onValueChange={onChange} disabled={!companyId || isLoading}>
      <SelectTrigger className="w-full max-w-md" data-testid="select-trigger">
        <SelectValue placeholder={isLoading ? 'Loading plans...' : 'Select a plan'} />
      </SelectTrigger>
      <SelectContent className="z-50">
        {plans.length === 0 && <SelectItem value="none" disabled>No plans found</SelectItem>}
        {plans.map((plan: CompanyPlan) => (
          <SelectItem key={plan.planId} value={plan.planId.toString()}>
            {plan.planName || `Plan ${plan.planId}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
