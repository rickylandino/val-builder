import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateCompanyPlanDialog } from '@/components/plans/CreateCompanyPlanDialog';

vi.mock('@/hooks/api/useCompanyPlans', () => {
  const mockMutateAsync = vi.fn();
  const mockUseCreateCompanyPlan = vi.fn(() => ({ mutateAsync: mockMutateAsync, isPending: false }));
  return {
    useCreateCompanyPlan: mockUseCreateCompanyPlan,
    __esModule: true,
    mockMutateAsync,
    mockUseCreateCompanyPlan,
  };
});

let useCompanyPlansModule: any;

beforeAll(async () => {
  useCompanyPlansModule = await import('@/hooks/api/useCompanyPlans');
});

describe('CreateCompanyPlanDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
     useCompanyPlansModule.mockMutateAsync?.mockReset();
  });

  it('renders New Plan button and opens dialog', async () => {
    render(<CreateCompanyPlanDialog companyId={1} />);
    const openBtn = screen.getByRole('button', { name: /New Plan/i });
    expect(openBtn).toBeInTheDocument();
    await userEvent.click(openBtn);
    expect(screen.getByText(/Create Company Plan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Plan Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Plan Year End/i)).toBeInTheDocument();
  });

  it('validates MM/dd format and shows alert on invalid input', async () => {
    globalThis.alert = vi.fn();
    render(<CreateCompanyPlanDialog companyId={1} />);
    await userEvent.click(screen.getByRole('button', { name: /New Plan/i }));
    await userEvent.type(screen.getByLabelText(/Plan Name/i), 'Test Plan');
    await userEvent.type(screen.getByLabelText(/Description/i), 'Desc');
    await userEvent.type(screen.getByLabelText(/Plan Year End/i), '13/31');
    await userEvent.click(screen.getByRole('button', { name: /Create/i }));
    expect(useCompanyPlansModule.mockMutateAsync).not.toHaveBeenCalled();
  });

  it('calls mutation and closes dialog on valid submit', async () => {
    useCompanyPlansModule.mockMutateAsync.mockResolvedValueOnce({});
    render(<CreateCompanyPlanDialog companyId={1} />);
    await userEvent.click(screen.getByRole('button', { name: /New Plan/i }));
    await userEvent.type(screen.getByLabelText(/Plan Name/i), 'Test Plan');
    await userEvent.type(screen.getByLabelText(/Description/i), 'Desc');
    await userEvent.type(screen.getByLabelText(/Plan Year End/i), '12/31');
    await userEvent.click(screen.getByRole('button', { name: /Create/i }));
    expect(useCompanyPlansModule.mockMutateAsync).toHaveBeenCalledWith({ planName: 'Test Plan', description: 'Desc', planYearEnd: '12/31' });
    expect(screen.queryByRole('button', { name: /Create/i })).not.toBeInTheDocument();
  });

  it('calls onCreated callback after successful creation', async () => {
    const onCreated = vi.fn();
    useCompanyPlansModule.mockMutateAsync.mockResolvedValueOnce({});
    render(<CreateCompanyPlanDialog companyId={1} onCreated={onCreated} />);
    await userEvent.click(screen.getByRole('button', { name: /New Plan/i }));
    await userEvent.type(screen.getByLabelText(/Plan Name/i), 'Test Plan');
    await userEvent.type(screen.getByLabelText(/Description/i), 'Desc');
    await userEvent.type(screen.getByLabelText(/Plan Year End/i), '12/31');
    await userEvent.click(screen.getByRole('button', { name: /Create/i }));
    expect(onCreated).toHaveBeenCalled();
  });
});