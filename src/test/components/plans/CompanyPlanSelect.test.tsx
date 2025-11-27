import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanyPlanSelect } from '@/components/plans/CompanyPlanSelect';
import { useCompanyPlans } from '@/hooks/api/useCompanyPlans';

vi.mock('@/hooks/api/useCompanyPlans', () => ({
  useCompanyPlans: vi.fn(),
}));

const mockPlans = [
  { planId: 1, planName: 'Plan 1' },
  { planId: 2, planName: 'Plan 2' },
];

describe('CompanyPlanSelect', () => {
  let onChange: (val: string) => void;

  beforeEach(() => {
    onChange = vi.fn();
    vi.resetAllMocks();
  });

  it('renders loading state', () => {
    (useCompanyPlans as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    render(<CompanyPlanSelect companyId={123} value="" onChange={onChange} />);
    expect(screen.getByText(/Loading plans/i)).toBeInTheDocument();
  });

  it('disables select when no companyId', () => {
    (useCompanyPlans as ReturnType<typeof vi.fn>).mockReturnValue({ data: mockPlans, isLoading: false });
    render(<CompanyPlanSelect companyId={null} value="" onChange={onChange} />);
    expect(screen.getByTestId('select-trigger')).toBeDisabled();
  });

  it('disables select when loading', () => {
    (useCompanyPlans as ReturnType<typeof vi.fn>).mockReturnValue({ data: mockPlans, isLoading: true });
    render(<CompanyPlanSelect companyId={123} value="" onChange={onChange} />);
    expect(screen.getByTestId('select-trigger')).toBeDisabled();
  });
});
