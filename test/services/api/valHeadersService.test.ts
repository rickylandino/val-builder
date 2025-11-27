import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api/client', () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

import { apiClient } from '@/services/api/client';
import { valHeadersService } from '@/services/api/valHeadersService';

const mockHeader = { id: 1, name: 'Header', companyId: 2, planId: 3 };
const mockHeaders = [mockHeader];
const newHeader = {
    "valId": 4,
    "planId": 4,
    "valDescription": "Custom VAL",
    "valDate": null,
    "planYearBeginDate": "2026-01-01T00:00:00",
    "planYearEndDate": "2026-12-31T00:00:00",
    "recipientName": null,
    "recipientAddress1": null,
    "recipientAddress2": null,
    "recipientCity": null,
    "recipientState": null,
    "recipientZip": null,
    "finalizeDate": null,
    "finalizedBy": null,
    "wordDocPath": null,
    "valstatusId": null,
    "marginLeftRight": null,
    "marginTopBottom": null,
    "fontSize": null,
    "valYear": 2026,
    "valQuarter": 1
};

describe('valHeadersService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getByCompany calls apiClient.get and returns data', async () => {
		(apiClient.get as any).mockResolvedValueOnce({ data: mockHeaders });
		const result = await valHeadersService.getByCompany(2);
		expect(apiClient.get).toHaveBeenCalledWith('/api/valheader?companyId=2');
		expect(result).toEqual(mockHeaders);
	});

	it('getByPlan calls apiClient.get and returns data', async () => {
		(apiClient.get as any).mockResolvedValueOnce({ data: mockHeaders });
		const result = await valHeadersService.getByPlan(3);
		expect(apiClient.get).toHaveBeenCalledWith('/api/valheader?planId=3');
		expect(result).toEqual(mockHeaders);
	});

	it('createValHeader calls apiClient.post and returns data', async () => {
		(apiClient.post as any).mockResolvedValueOnce({ data: mockHeader });
		const result = await valHeadersService.createValHeader(newHeader);
		expect(apiClient.post).toHaveBeenCalledWith('/api/valheader', newHeader);
		expect(result).toEqual(mockHeader);
	});

	it('getByCompany propagates errors from apiClient', async () => {
		(apiClient.get as any).mockRejectedValueOnce(new Error('Network error'));
		await expect(valHeadersService.getByCompany(2)).rejects.toThrow('Network error');
	});

	it('getByPlan propagates errors from apiClient', async () => {
		(apiClient.get as any).mockRejectedValueOnce(new Error('Network error'));
		await expect(valHeadersService.getByPlan(3)).rejects.toThrow('Network error');
	});

	it('createValHeader propagates errors from apiClient', async () => {
		(apiClient.post as any).mockRejectedValueOnce(new Error('Create failed'));
		await expect(valHeadersService.createValHeader(newHeader)).rejects.toThrow('Create failed');
	});
});
