import { describe, it, expect, beforeAll, vi, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ValHeadersTable } from '@/components/vals/ValHeadersTable';
import * as ValBuilderDrawerModule from '@/components/val-builder/ValBuilderDrawer';
import { ValBuilderProvider } from '@/contexts/ValBuilderContext';
import * as ValBuilderContext from '@/contexts/ValBuilderContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ValHeader } from '@/types/api/ValHeader';

function makeValHeader(overrides: Partial<ValHeader> = {}): ValHeader {
	return {
		valId: 1,
		planId: 2,
		valDescription: 'Test VAL',
		valDate: '2025-06-01T00:00:00Z',
		planYearBeginDate: '2025-01-01T00:00:00Z',
		planYearEndDate: '2025-12-31T00:00:00Z',
		recipientName: 'John Doe',
		recipientAddress1: '123 Main St',
		recipientAddress2: null,
		recipientCity: 'Springfield',
		recipientState: 'IL',
		recipientZip: '62704',
		finalizeDate: '2025-06-10T00:00:00Z',
		finalizedBy: 'Jane Smith',
		wordDocPath: null,
		valstatusId: 1,
		marginLeftRight: null,
		marginTopBottom: null,
		fontSize: null,
		valYear: 2024,
		valQuarter: 2,
		...overrides,
	};
}

let queryClient: QueryClient;

const renderValBuilder = (valHeaders: ValHeader[]) => {
    queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <ValBuilderProvider>
                <ValHeadersTable valHeaders={valHeaders} />
            </ValBuilderProvider>
        </QueryClientProvider>
    );
};

describe('ValHeadersTable', () => {
	beforeAll(() => {
		vi.spyOn(ValBuilderDrawerModule, 'ValBuilderDrawer').mockImplementation(({ open, onClose }) => {
			return (
				<>
					{open ? (
						<button data-testid="cancel-btn" onClick={onClose}>Cancel</button>
					) : (
						<div style={{ display: 'none' }} />
					)}
				</>
			);
		});
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	it('calls context methods on handleClose', async () => {
		const resetContext = vi.fn();
		(vi.spyOn(ValBuilderContext, 'useValBuilder') as any).mockReturnValue({
			resetContext
			// Provide other context values as needed for rendering
		});
		const valHeaders = [makeValHeader({ valId: 123 })];
		renderValBuilder(valHeaders);
		const openBtn = screen.getByRole('button', { name: /open/i });
		fireEvent.click(openBtn);
		await waitFor(() => expect(screen.getByTestId('cancel-btn')).toBeInTheDocument());
		fireEvent.click(screen.getByTestId('cancel-btn'));
		expect(resetContext).toHaveBeenCalled();
		vi.restoreAllMocks();
	});
	it('renders empty state when no valHeaders', () => {
		renderValBuilder([]);
		expect(screen.getByText(/no valuation letters found/i)).toBeInTheDocument();
	});

	it('renders table rows for valHeaders', () => {
		const valHeaders = [
			makeValHeader({ valId: 1, valDescription: 'VAL 1' }),
			makeValHeader({ valId: 2, valDescription: 'VAL 2', finalizedBy: null }),
		];
		renderValBuilder(valHeaders);
		expect(screen.getByText('VAL 1')).toBeInTheDocument();
		expect(screen.getByText('VAL 2')).toBeInTheDocument();
		// Finalized By fallback
		expect(screen.getAllByText('-')[0]).toBeInTheDocument();
	});

	it('renders fallback for missing fields', () => {
		const valHeaders = [
			makeValHeader({
				valDescription: null,
				planYearBeginDate: null,
				planYearEndDate: null,
				valDate: null,
				finalizeDate: null,
				finalizedBy: null,
			}),
		];
		renderValBuilder(valHeaders);
		// All fields should fallback to '-'
		expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(5);
	});

	it('opens drawer with correct valHeader on button click', () => {
		const valHeaders = [makeValHeader({ valId: 42, valDescription: 'VAL X' })];
		renderValBuilder(valHeaders);
		const openBtn = screen.getByRole('button', { name: /open/i });
		fireEvent.click(openBtn);
		// Drawer content should appear in portal
		expect(screen.getByText(/loading val builder/i)).toBeInTheDocument();
	});

	it('closes drawer when onClose is triggered', () => {
		const valHeaders = [makeValHeader({ valId: 99 })];
		renderValBuilder(valHeaders);
		const openBtn = screen.getByRole('button', { name: /open/i });
		fireEvent.click(openBtn);
        
        waitFor(() => {
            // Drawer content should appear in portal
            expect(screen.getByTestId('cancel-btn')).toBeInTheDocument();
            
		// Instead, test by clicking "Cancel" button in ValBuilder footer
		const cancelBtn = screen.getByTestId('cancel-btn');
		fireEvent.click(cancelBtn);
		// Drawer should disappear (Loading text gone)
		expect(screen.getByTestId('editor-content')).not.toBeInTheDocument();
        })
	});
});
