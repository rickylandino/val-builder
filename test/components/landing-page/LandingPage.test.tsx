import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LandingPage } from '@/components/LandingPage';
import { useCompanies } from '@/hooks/api/useCompanies';
import { useValHeaders } from '@/hooks/api/useValHeaders';

// Mock hooks
vi.mock('@/hooks/api/useCompanies', () => ({
  useCompanies: vi.fn(),
}));
vi.mock('@/hooks/api/useValHeaders', () => ({
  useValHeaders: vi.fn(),
}));

// Mock child components
vi.mock('@/components/plans/CompanyPlanSelect', () => ({
  CompanyPlanSelect: ({ value, onChange }: any) => (
    <select data-testid="plan-select" value={value} onChange={e => onChange(e.target.value)}>
      <option value="all">All Plans</option>
      <option value="4">Plan 4</option>
    </select>
  ),
}));
vi.mock('@/components/plans/CreateCompanyPlanDialog', () => ({
  CreateCompanyPlanDialog: () => <button data-testid="create-plan">Create Plan</button>,
}));
vi.mock('@/components/companies/CreateCompanyDialog', () => ({
  CreateCompanyDialog: () => <button data-testid="create-company">Create Company</button>,
}));
vi.mock('@/components/vals/CreateValDialog', () => ({
  CreateValDialog: () => <button data-testid="create-val">Create Val</button>,
}));
vi.mock('@/components/vals/ValHeadersTable', () => ({
  ValHeadersTable: ({ valHeaders }: any) => (
    <div data-testid="val-headers-table">{valHeaders.length} letters</div>
  ),
}));

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    (useCompanies as any).mockReturnValue({ data: undefined, isLoading: true, error: null });
    (useValHeaders as any).mockReturnValue({ data: [], isLoading: false, error: null });
    render(<LandingPage />);
    expect(screen.getByText(/Loading companies/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useCompanies as any).mockReturnValue({ data: undefined, isLoading: false, error: { message: 'Failed' } });
    (useValHeaders as any).mockReturnValue({ data: [], isLoading: false, error: null });
    render(<LandingPage />);
    expect(screen.getByText(/Error loading companies/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed/)).toBeInTheDocument();
  });

  it('renders company and plan selection', () => {
    (useCompanies as any).mockReturnValue({
      data: [
        { companyId: 2, name: 'Acme' },
        { companyId: 3, name: 'Beta' },
      ],
      isLoading: false,
      error: null,
    });
    (useValHeaders as any).mockReturnValue({
      data: [{ id: 1 }, { id: 2 }],
      isLoading: false,
      error: null,
    });
    render(<LandingPage />);
    expect(screen.getByText(/VAL Builder/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by Company/i)).toBeInTheDocument();
    expect(screen.getByTestId('create-company')).toBeInTheDocument();
    expect(screen.getByTestId('plan-select')).toBeInTheDocument();
    expect(screen.getByTestId('create-plan')).toBeInTheDocument();
  });

  it('renders valuation letters table with correct count', () => {
    (useCompanies as any).mockReturnValue({
      data: [{ companyId: 2, name: 'Acme' }],
      isLoading: false,
      error: null,
    });
    (useValHeaders as any).mockReturnValue({
      data: [{ id: 1 }, { id: 2 }, { id: 3 }],
      isLoading: false,
      error: null,
    });
    render(<LandingPage />);
    expect(screen.getByTestId('val-headers-table')).toHaveTextContent('3 letters');
    expect(screen.getByTestId('create-val')).toBeInTheDocument();
  });

  it('handles company and plan selection changes', () => {
    (useCompanies as any).mockReturnValue({
      data: [
        { companyId: 2, name: 'Acme' },
        { companyId: 3, name: 'Beta' },
      ],
      isLoading: false,
      error: null,
    });
    (useValHeaders as any).mockReturnValue({
      data: [{ id: 1 }],
      isLoading: false,
      error: null,
    });
    render(<LandingPage />);
    const planSelect = screen.getByTestId('plan-select');
    fireEvent.change(planSelect, { target: { value: '4' } });
    expect(planSelect).toHaveValue('4');
  });

  it('shows error if valHeaders fails', () => {
    (useCompanies as any).mockReturnValue({
      data: [{ companyId: 2, name: 'Acme' }],
      isLoading: false,
      error: null,
    });
    (useValHeaders as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: { message: 'ValHeaders error' },
    });
    render(<LandingPage />);
    expect(screen.getByText(/Error loading valuation letters/i)).toBeInTheDocument();
    expect(screen.getByText(/ValHeaders error/)).toBeInTheDocument();
  });
});
