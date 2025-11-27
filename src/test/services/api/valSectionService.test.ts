import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api/client', () => ({
	apiClient: {
		get: vi.fn(),
	},
}));

import { apiClient } from '@/services/api/client';
import { valSectionService } from '@/services/api/valSectionService';

const mockSection = { id: 1, groupId: 2, name: 'Section', displayOrder: 1 };
const mockSections = [mockSection];

describe('valSectionService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getAll calls apiClient.get and returns data', async () => {
		(apiClient.get as any).mockResolvedValueOnce({ data: mockSections });
		const result = await valSectionService.getAll();
		expect(apiClient.get).toHaveBeenCalledWith('/api/valsections');
		expect(result).toEqual(mockSections);
	});

	it('getByGroupId calls apiClient.get and returns data', async () => {
		(apiClient.get as any).mockResolvedValueOnce({ data: mockSection });
		const result = await valSectionService.getByGroupId(2);
		expect(apiClient.get).toHaveBeenCalledWith('/api/valsections/2');
		expect(result).toEqual(mockSection);
	});

	it('getAllByGroupId calls apiClient.get and returns data', async () => {
		(apiClient.get as any).mockResolvedValueOnce({ data: mockSections });
		const result = await valSectionService.getAllByGroupId(2);
		expect(apiClient.get).toHaveBeenCalledWith('/api/valsections/group/2');
		expect(result).toEqual(mockSections);
	});

	it('getAll propagates errors from apiClient', async () => {
		(apiClient.get as any).mockRejectedValueOnce(new Error('Network error'));
		await expect(valSectionService.getAll()).rejects.toThrow('Network error');
	});

	it('getByGroupId propagates errors from apiClient', async () => {
		(apiClient.get as any).mockRejectedValueOnce(new Error('Not found'));
		await expect(valSectionService.getByGroupId(2)).rejects.toThrow('Not found');
	});

	it('getAllByGroupId propagates errors from apiClient', async () => {
		(apiClient.get as any).mockRejectedValueOnce(new Error('Network error'));
		await expect(valSectionService.getAllByGroupId(2)).rejects.toThrow('Network error');
	});
});
