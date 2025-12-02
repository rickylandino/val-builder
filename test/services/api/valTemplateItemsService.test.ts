import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api/client', () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

import { apiClient } from '@/services/api/client';
import { valTemplateItemsService } from '@/services/api/valTemplateItemsService';

const mockItem = { itemId: 1, groupId: 2, itemText: 'TemplateItem', displayOrder: 1, blankLineAfter: 0, bold: false, center: false, indent: 0, bullet: false, defaultOnVal: false, tightLineHeight: true };
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

	it('create calls apiClient.post and returns data', async () => {
		(apiClient.post as any).mockResolvedValueOnce({ data: mockItem });
		const result = await valTemplateItemsService.create(2, 1);
		expect(apiClient.post).toHaveBeenCalledWith('/api/valtemplateitems', { groupId: 2, templateItemId: 1 });
		expect(result).toEqual(mockItem);
	});

	it('create propagates errors from apiClient', async () => {
		(apiClient.post as any).mockRejectedValueOnce(new Error('Create error'));
		await expect(valTemplateItemsService.create(2, 1)).rejects.toThrow('Create error');
	});

	it('update calls apiClient.put and returns data', async () => {
		(apiClient.put as any).mockResolvedValueOnce({ data: mockItem });
		const result = await valTemplateItemsService.update(mockItem);
		expect(apiClient.put).toHaveBeenCalledWith('/api/valtemplateitems/1', mockItem);
		expect(result).toEqual(mockItem);
	});

	it('update propagates errors from apiClient', async () => {
		(apiClient.put as any).mockRejectedValueOnce(new Error('Update error'));
		await expect(valTemplateItemsService.update(mockItem)).rejects.toThrow('Update error');
	});

    it('updateDisplayOrder calls apiClient.put and returns data', async () => {
		(apiClient.put as any).mockResolvedValueOnce({ data: undefined });
		const result = await valTemplateItemsService.updateDisplayOrder(1, [{ itemId: 1, displayOrder: 2 }]);
		expect(apiClient.put).toHaveBeenCalledWith('/api/valtemplateitems/displayorder', { groupId: 1, items: [{ itemId: 1, displayOrder: 2 }] });
		expect(result).toBeUndefined();
	});

    it('updateDisplayOrder propagates errors from apiClient', async () => {
        (apiClient.put as any).mockRejectedValueOnce(new Error('Update order error'));
        await expect(valTemplateItemsService.updateDisplayOrder(1, [{ itemId: 1, displayOrder: 2 }])).rejects.toThrow('Update order error');
    });

	it('delete calls apiClient.delete', async () => {
		(apiClient.delete as any).mockResolvedValueOnce(undefined);
		await valTemplateItemsService.delete(1);
		expect(apiClient.delete).toHaveBeenCalledWith('/api/valtemplateitems/1');
	});

	it('delete propagates errors from apiClient', async () => {
		(apiClient.delete as any).mockRejectedValueOnce(new Error('Delete error'));
		await expect(valTemplateItemsService.delete(1)).rejects.toThrow('Delete error');
	});
});
