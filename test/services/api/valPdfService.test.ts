import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api/client', () => ({
	apiClient: {
		get: vi.fn(),
	},
}));

import { apiClient } from '@/services/api/client';
import { valPdfService } from '@/services/api/valPdfService';

const mockBlob = new Blob(['test'], { type: 'application/pdf' });

describe('valPdfService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('generatePdf calls apiClient.get and returns Blob', async () => {
		(apiClient.get as any).mockResolvedValueOnce({ data: mockBlob });
		const result = await valPdfService.generatePdf(1, true);
		expect(apiClient.get).toHaveBeenCalledWith('/api/val/1/pdf', {
			params: { includeHeaders: true },
			responseType: 'blob',
		});
		expect(result).toBe(mockBlob);
	});

	it('openPdfInNewTab opens new tab and revokes URL', async () => {
		vi.spyOn(valPdfService, 'generatePdf').mockResolvedValueOnce(mockBlob);
		const urlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
		const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
		const openSpy = vi.spyOn(globalThis, 'open').mockReturnValue({} as Window);
		const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn) => { fn(); return 1; });
		await valPdfService.openPdfInNewTab(1, false);
		expect(urlSpy).toHaveBeenCalledWith(mockBlob);
		expect(openSpy).toHaveBeenCalledWith('blob:url', '_blank');
		expect(revokeSpy).toHaveBeenCalledWith('blob:url');
		setTimeoutSpy.mockRestore();
	});

	it('openPdfInNewTab throws if popup blocked', async () => {
		vi.spyOn(valPdfService, 'generatePdf').mockResolvedValueOnce(mockBlob);
		vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
		vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
		vi.spyOn(globalThis, 'open').mockReturnValue(null);
		await expect(valPdfService.openPdfInNewTab(1, false)).rejects.toThrow('Unable to open PDF');
	});

	it('downloadPdf creates link and triggers download', async () => {
		vi.spyOn(valPdfService, 'generatePdf').mockResolvedValueOnce(mockBlob);
		vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
		vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
		const clickSpy = vi.fn();
		// Create a real anchor element and spy on click
		const link = document.createElement('a');
		Object.defineProperty(link, 'click', { value: clickSpy });
		vi.spyOn(document, 'createElement').mockReturnValue(link);
		await valPdfService.downloadPdf(1, true, 'file');
		expect(link.href).toBe('blob:url');
		expect(link.download).toBe('file.pdf');
		expect(clickSpy).toHaveBeenCalled();
	});

	it('generatePdf propagates errors from apiClient', async () => {
		(apiClient.get as any).mockRejectedValueOnce(new Error('Network error'));
		await expect(valPdfService.generatePdf(1, true)).rejects.toThrow('Network error');
	});
});
