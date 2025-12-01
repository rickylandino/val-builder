import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PdfAttachmentsDialog } from '@/components/val-attachments/PdfAttachmentsDialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as hooks from '@/hooks/api/useValPdfAttachments';
import * as service from '@/services/api/valPdfAttachmentsService';

function renderDialog(props: Partial<{ open: boolean; valId: number; onOpenChange: (open: boolean) => void }> = {}) {
	const queryClient = new QueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			<PdfAttachmentsDialog open={props.open ?? true} valId={props.valId ?? 1} onOpenChange={props.onOpenChange ?? (() => {})} />
		</QueryClientProvider>
	);
}

const mockAttachment = {
	pdfId: 1,
	valId: 1,
	pdfName: 'resume',
	displayOrder: 1,
	pdfContents: 'base64string',
};

describe('PdfAttachmentsDialog', () => {
	it('auto-populates name from selected PDF file', async () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [], isLoading: false }); 
		renderDialog();
		const input = screen.getByLabelText(/select pdf file/i);
		const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
		fireEvent.change(input, { target: { files: [file] } });
		await waitFor(() => {
			expect(screen.getByDisplayValue('resume')).toBeInTheDocument();
		});
	});

	it('uploads PDF successfully and shows success toast', async () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [], isLoading: false });
		const mutateAsync = vi.fn().mockResolvedValue({});
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useUploadPdfAttachment').mockReturnValue({ mutateAsync });
		// Mock FileReader
		const fileReaderMock = {
			readAsDataURL: vi.fn(function(this: any, file: File) {
				this.onload({ target: { result: 'data:application/pdf;base64,FAKEBASE64' } });
			}),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			onload: null,
			onerror: null,
			result: 'data:application/pdf;base64,FAKEBASE64',
		};
		vi.stubGlobal('FileReader', function() { return fileReaderMock; });
		renderDialog();
		const input = screen.getByLabelText(/select pdf file/i);
		const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
		fireEvent.change(input, { target: { files: [file] } });
		const uploadBtn = screen.getByRole('button', { name: /upload pdf/i });
		fireEvent.click(uploadBtn);
		await waitFor(() => {
			expect(mutateAsync).toHaveBeenCalledWith({
				valId: 1,
				pdfName: 'resume',
				pdfContents: 'FAKEBASE64',
				displayOrder: 1,
			});
			expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/pdf uploaded successfully/i));
		});
		vi.unstubAllGlobals();
	});

	it('shows error toast if upload fails', async () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [], isLoading: false });
		const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'));
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useUploadPdfAttachment').mockReturnValue({ mutateAsync });
		// Mock FileReader
		const fileReaderMock = {
			readAsDataURL: vi.fn(function(this: any, file: File) {
				this.onload({ target: { result: 'data:application/pdf;base64,FAKEBASE64' } });
			}),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			onload: null,
			onerror: null,
			result: 'data:application/pdf;base64,FAKEBASE64',
		};
		vi.stubGlobal('FileReader', function() { return fileReaderMock; });
		renderDialog();
		const input = screen.getByLabelText(/select pdf file/i);
		const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
		fireEvent.change(input, { target: { files: [file] } });
		const uploadBtn = screen.getByRole('button', { name: /upload pdf/i });
		fireEvent.click(uploadBtn);
		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/failed to upload pdf/i));
		});
		vi.unstubAllGlobals();
	});

	it('shows success toast after download', async () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [mockAttachment], isLoading: false });
		vi.spyOn(service.valPdfAttachmentsService, 'downloadToFile').mockResolvedValue();
		renderDialog();
		fireEvent.click(screen.getByTitle(/download pdf/i));
		await waitFor(() => {
			expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/download started/i));
		});
	});

	it('shows success toast after delete', async () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [mockAttachment], isLoading: false });
		vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
		const deleteSpy = (vi.fn() as any).mockResolvedValue();
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useDeletePdfAttachment').mockReturnValue({ mutateAsync: deleteSpy, isPending: false });
		renderDialog();
		fireEvent.click(screen.getByTitle(/delete attachment/i));
		await waitFor(() => {
			expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/attachment deleted successfully/i));
		});
	});
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders dialog with empty state', () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [], isLoading: false });
		renderDialog();
		expect(screen.getAllByText(/pdf attachments/i).length).toBeGreaterThan(0);
		expect(screen.getByText(/no attachments/i)).toBeInTheDocument();
		expect(screen.getByText(/upload new pdf/i)).toBeInTheDocument();
	});

	it('renders loading state', () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: undefined, isLoading: true });
		renderDialog();
		expect(screen.getByText(/loading attachments/i)).toBeInTheDocument();
	});

	it('renders with attachments', () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [mockAttachment], isLoading: false });
		renderDialog();
		expect(screen.getByText('resume')).toBeInTheDocument();
		expect(screen.getByText(/pdf attachment #1/i)).toBeInTheDocument();
		expect(screen.getByTitle(/download pdf/i)).toBeInTheDocument();
		expect(screen.getByTitle(/delete attachment/i)).toBeInTheDocument();
	});

	it('calls download service on download button click', async () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [mockAttachment], isLoading: false });
		const downloadSpy = vi.spyOn(service.valPdfAttachmentsService, 'downloadToFile').mockResolvedValue();
		renderDialog();
		fireEvent.click(screen.getByTitle(/download pdf/i));
		await waitFor(() => expect(downloadSpy).toHaveBeenCalledWith(1, 'resume'));
	});

	it('calls delete mutation on delete button click and confirm', async () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [mockAttachment], isLoading: false });
		vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
		const deleteSpy = (vi.fn() as any).mockResolvedValue();
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useDeletePdfAttachment').mockReturnValue({ mutateAsync: deleteSpy, isPending: false });
		renderDialog();
		fireEvent.click(screen.getByTitle(/delete attachment/i));
		await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith({ id: 1, valId: 1 }));
	});

	it('does not call delete if confirm is cancelled', async () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [mockAttachment], isLoading: false });
		vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
		const deleteSpy = vi.fn();
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useDeletePdfAttachment').mockReturnValue({ mutateAsync: deleteSpy, isPending: false });
		renderDialog();
		fireEvent.click(screen.getByTitle(/delete attachment/i));
		await waitFor(() => expect(deleteSpy).not.toHaveBeenCalled());
	});

	it('shows error toast for invalid file type', async () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [], isLoading: false });
		renderDialog();
		const input = screen.getByLabelText(/select pdf file/i);
		const file = new File(['test'], 'test.txt', { type: 'text/plain' });
		const toastSpy = vi.spyOn(toast, 'error');
		fireEvent.change(input, { target: { files: [file] } });
		expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/please select a pdf file/i));
	});

	it('shows error toast if upload is attempted with no name', async () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [], isLoading: false });
		renderDialog();
		// Simulate file selection
		const input = screen.getByLabelText(/select pdf file/i);
		const file = new File(['test'], 'resume.pdf', { type: 'application/pdf' });
		fireEvent.change(input, { target: { files: [file] } });
		// Clear name
		const nameInput = screen.getByPlaceholderText('Enter attachment name');
		fireEvent.change(nameInput, { target: { value: '' } });
		const uploadBtn = screen.getByRole('button', { name: /upload pdf/i });
		const toastSpy = vi.spyOn(toast, 'error');
		fireEvent.click(uploadBtn);
		expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/please enter a name/i));
	});

	it('close button calls onOpenChange', () => {
        //@ts-ignore - Ignore as we are only mocking part of the return value
		vi.spyOn(hooks, 'useValPdfAttachments').mockReturnValue({ data: [], isLoading: false });
		const onOpenChange = vi.fn();
		renderDialog({ onOpenChange });
		// There are multiple 'Close' buttons, click the first one
		const closeButtons = screen.getAllByRole('button', { name: /close/i });
		fireEvent.click(closeButtons[0]);
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
