import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ValBuilder } from '@/components/val-builder/ValBuilder';
import { valHeader } from './test-data';

// Dynamic mock state for hooks
let useValSectionsMock: { data: any; isLoading: boolean; error: Error | null } = { data: [{ groupId: 1, sectionText: 'Section 1', displayOrder: 1 }], isLoading: false, error: null };
let useAllValDetailsImpl = () => ({ data: [{ valDetailsId: 1, groupId: 1, displayOrder: 1 }], isLoading: false });
let useSaveValChangesImpl = () => ({ mutateAsync: vi.fn(), isSuccess: false, isPending: false });

vi.mock('@/components/header/Header', () => ({ Header: ({ client, valDescription }: any) => <div data-testid="header">{client} - {valDescription}</div> }));
vi.mock('@/components/sections/SectionNavigation', () => ({ SectionNavigation: () => <div data-testid="section-navigation">SectionNavigation</div> }));
vi.mock('@/components/sections/SectionContent', () => ({ SectionContent: () => <div data-testid="section-content">SectionContent</div> }));
vi.mock('@/components/val-builder/ValPreview', () => ({ ValPreview: () => <div data-testid="val-preview">ValPreview</div> }));
vi.mock('@/hooks/api/useValSections', () => ({ useValSections: () => useValSectionsMock }));
vi.mock('@/hooks/api/useValTemplateItems', () => ({ useValTemplateItemsByGroupId: () => ({ data: [{ itemId: 1, itemText: 'Card 1' }] }) }));
vi.mock('@/hooks/api/useValDetails', () => ({
	useAllValDetails: () => useAllValDetailsImpl(),
	useSaveValChanges: () => useSaveValChangesImpl(),
}));
vi.mock('@/hooks/useSectionChanges', () => ({ useSectionChanges: () => ({ editorContent: '', updateEditorContent: vi.fn(), getAllChanges: () => [], hasChanges: () => false, resetChanges: vi.fn(), updateSingleValDetail: vi.fn() }) }));
vi.mock('@/services/api/valPdfService', () => ({ valPdfService: { openPdfInNewTab: vi.fn() } }));

const createTestQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });
const renderWithQueryClient = (ui: React.ReactElement) => {
	const queryClient = createTestQueryClient();
	return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};


describe('ValBuilder', () => {
		it('renders error state', () => {
			useValSectionsMock = { data: [], isLoading: false, error: new Error('Failed to load') };
			renderWithQueryClient(<ValBuilder valHeader={valHeader} />);
			expect(screen.getByText(/Error loading sections/)).toBeInTheDocument();
			expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
			// Reset for other tests
			useValSectionsMock = { data: [{ groupId: 1, sectionText: 'Section 1', displayOrder: 1 }], isLoading: false, error: null };
		});
	it('renders loading state', () => {
		useAllValDetailsImpl = () => ({ data: [], isLoading: true });
		useValSectionsMock = { data: null, isLoading: true, error: null };
		renderWithQueryClient(<ValBuilder valHeader={valHeader} />);
		expect(screen.getByText('Loading VAL Builder...')).toBeInTheDocument();
		// Reset for other tests
		useAllValDetailsImpl = () => ({ data: [{ valDetailsId: 1, groupId: 1, displayOrder: 1 }], isLoading: false });
		useValSectionsMock = { data: [{ groupId: 1, sectionText: 'Section 1', displayOrder: 1 }], isLoading: false, error: null };
	});

	it('renders header and mode selector', () => {
		renderWithQueryClient(<ValBuilder valHeader={valHeader} />);
		expect(screen.getByTestId('header')).toHaveTextContent('Test Company - Test VAL');
		expect(screen.getByText('View Mode:')).toBeInTheDocument();
		expect(screen.getByRole('combobox')).toBeInTheDocument();
	});

	it('renders SectionNavigation and SectionContent in edit mode', () => {
		renderWithQueryClient(<ValBuilder valHeader={valHeader} />);
		expect(screen.getByTestId('section-navigation')).toBeInTheDocument();
		expect(screen.getByTestId('section-content')).toBeInTheDocument();
		expect(screen.queryByTestId('val-preview')).not.toBeInTheDocument();
	});

	it('renders ValPreview in preview-sections mode', () => {
		renderWithQueryClient(<ValBuilder valHeader={valHeader} />);
		fireEvent.change(screen.getByRole('combobox'), { target: { value: 'preview-sections' } });
		expect(screen.getByTestId('val-preview')).toBeInTheDocument();
		expect(screen.queryByTestId('section-navigation')).not.toBeInTheDocument();
		expect(screen.queryByTestId('section-content')).not.toBeInTheDocument();
	});

	it('renders ValPreview in preview-final mode', () => {
		renderWithQueryClient(<ValBuilder valHeader={valHeader} />);
		fireEvent.change(screen.getByRole('combobox'), { target: { value: 'preview-final' } });
		expect(screen.getByTestId('val-preview')).toBeInTheDocument();
		expect(screen.queryByTestId('section-navigation')).not.toBeInTheDocument();
		expect(screen.queryByTestId('section-content')).not.toBeInTheDocument();
	});

	it('renders footer with correct buttons and status', () => {
		renderWithQueryClient(<ValBuilder valHeader={valHeader} />);
		expect(screen.getByTestId('cancel-btn')).toBeInTheDocument();
		expect(screen.getByTestId('print-pdf-btn')).toBeInTheDocument();
		expect(screen.getByTestId('save-btn')).toBeInTheDocument();
	});
});
