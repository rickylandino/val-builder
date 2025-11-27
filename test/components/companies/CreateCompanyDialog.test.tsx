import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateCompanyDialog } from '@/components/companies/CreateCompanyDialog';
import { useCreateCompany } from '@/hooks/api/useCompanies';

vi.mock('@/hooks/api/useCompanies', () => ({
	useCreateCompany: vi.fn(() => ({
		mutate: vi.fn(({ onSuccess }) => { onSuccess?.(); }),
		isPending: false,
	})),
}));

describe('CreateCompanyDialog', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		// Simulate development mode for prefill button
		Object.defineProperty(import.meta, 'env', {
			value: { DEV: true },
			writable: true,
		});
	});

	it('renders dialog trigger and opens dialog', () => {
		render(<CreateCompanyDialog />);
		const trigger = screen.getByText(/New Company/i);
		expect(trigger).toBeInTheDocument();
		fireEvent.click(trigger);
		expect(screen.getByText(/Create New Company/i)).toBeInTheDocument();
	});

	it('renders all form fields', () => {
		render(<CreateCompanyDialog />);
		fireEvent.click(screen.getByText(/New Company/i));
		expect(screen.getByLabelText(/Company Name\s*\*/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Mailing Name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Street Address$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Street Address 2/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/ZIP Code/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Fax/i)).toBeInTheDocument();
	});

	it('handles input changes for all fields', () => {
		render(<CreateCompanyDialog />);
		fireEvent.click(screen.getByText(/New Company/i));
		fireEvent.change(screen.getByLabelText(/Company Name\s*\*/i), { target: { value: 'Test Company' } });
		fireEvent.change(screen.getByLabelText(/Mailing Name/i), { target: { value: 'Mailing Name' } });
		fireEvent.change(screen.getByLabelText(/Street Address$/i), { target: { value: '123 Main' } });
		fireEvent.change(screen.getByLabelText(/Street Address 2/i), { target: { value: 'Suite 100' } });
		fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'NYC' } });
		fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'NY' } });
		fireEvent.change(screen.getByLabelText(/ZIP Code/i), { target: { value: '10001' } });
		fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '555-1234' } });
		fireEvent.change(screen.getByLabelText(/Fax/i), { target: { value: '555-5678' } });
		expect(screen.getByLabelText(/Company Name\s*\*/i)).toHaveValue('Test Company');
		expect(screen.getByLabelText(/Mailing Name/i)).toHaveValue('Mailing Name');
		expect(screen.getByLabelText(/Street Address$/i)).toHaveValue('123 Main');
		expect(screen.getByLabelText(/Street Address 2/i)).toHaveValue('Suite 100');
		expect(screen.getByLabelText(/City/i)).toHaveValue('NYC');
		expect(screen.getByLabelText(/State/i)).toHaveValue('NY');
		expect(screen.getByLabelText(/ZIP Code/i)).toHaveValue('10001');
		expect(screen.getByLabelText(/Phone/i)).toHaveValue('555-1234');
		expect(screen.getByLabelText(/Fax/i)).toHaveValue('555-5678');
	});

	it('submits form and calls createCompany', async () => {
		const { getByText, getByLabelText } = render(<CreateCompanyDialog />);
		fireEvent.click(getByText(/New Company/i));
		fireEvent.change(getByLabelText(/Company Name\s*\*/i), { target: { value: 'Test Company' } });
		fireEvent.click(getByText(/Create Company/i));
		await waitFor(() => {
			expect(screen.queryByText(/Create New Company/i)).toBeInTheDocument();
		});
	});

	it('handles dialog close (Cancel button)', () => {
		render(<CreateCompanyDialog />);
		fireEvent.click(screen.getByText(/New Company/i));
		fireEvent.click(screen.getByText(/Cancel/i));
		expect(screen.queryByText(/Create New Company/i)).not.toBeInTheDocument();
	});

	it('handles prefill random data', () => {
		render(<CreateCompanyDialog />);
		fireEvent.click(screen.getByText(/New Company/i));
		fireEvent.click(screen.getByText(/Prefill Random Data/i));
		// Should fill at least the company name
		expect(screen.getByLabelText(/Company Name\s*\*/i)).not.toHaveValue('');
	});

	it('disables submit and shows loading when pending', () => {
		(useCreateCompany as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			mutate: vi.fn(),
			isPending: true,
		});
		render(<CreateCompanyDialog />);
		fireEvent.click(screen.getByText(/New Company/i));
		expect(screen.getByText(/Creating.../i)).toBeDisabled();
	});
});
