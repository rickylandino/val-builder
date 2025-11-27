import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api/client', () => ({
	apiClient: {
		get: vi.fn(),
	},
}));

import { apiClient } from '@/services/api/client';
import { valTemplateItemsService } from '@/services/api/valTemplateItemsService';

const mockItem = { id: 1, groupId: 2, name: 'TemplateItem' };
const mockItems = [mockItem];

describe('valTemplateItemsService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getAll calls apiClient.get and returns data', async () => {
		(apiClient.get as any).mockResolvedValueOnce({ data: mockItems });
		const result = await valTemplateItemsService.getAll(2);
		expect(apiClient.get).toHaveBeenCalledWith('/api/valtemplateitems?groupId=2');
		expect(result).toEqual(mockItems);
	});

	it('getAll propagates errors from apiClient', async () => {
		(apiClient.get as any).mockRejectedValueOnce(new Error('Network error'));
		await expect(valTemplateItemsService.getAll(2)).rejects.toThrow('Network error');
	});
});
