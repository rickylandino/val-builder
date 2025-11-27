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
import { valDetailsService } from '@/services/api/valDetailsService';
import { mockValDetail } from '../../components/val-builder/test-data';

const mockDetail = { valDetailsId: 'abc', valId: 1, groupId: 2, groupContent: 'A', displayOrder: 1 };
const mockDetails = [mockDetail];

describe('valDetailsService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getByValId calls apiClient.get and returns data', async () => {
		(apiClient.get as any).mockResolvedValueOnce({ data: mockDetails });
		const result = await valDetailsService.getByValId(1, 2);
		expect(apiClient.get).toHaveBeenCalledWith('/api/val/1/details?groupId=2');
		expect(result).toEqual(mockDetails);
	});

	it('create calls apiClient.post and returns data', async () => {
		(apiClient.post as any).mockResolvedValueOnce({ data: mockValDetail });
		const result = await valDetailsService.create(mockValDetail);
		expect(apiClient.post).toHaveBeenCalledWith('/api/val/1/details', mockValDetail);
		expect(result).toEqual(mockValDetail);
	});

	it('update calls apiClient.put and returns data', async () => {
		(apiClient.put as any).mockResolvedValueOnce({ data: mockValDetail });
		const result = await valDetailsService.update('abc', mockValDetail);
		expect(apiClient.put).toHaveBeenCalledWith('/api/val/1/details/abc', mockValDetail);
		expect(result).toEqual(mockValDetail);
	});

	it('delete calls apiClient.delete', async () => {
		(apiClient.delete as any).mockResolvedValueOnce({});
		await valDetailsService.delete('abc', 1);
		expect(apiClient.delete).toHaveBeenCalledWith('/api/val/1/details/abc');
	});

	it('batchUpdate calls apiClient.put', async () => {
		(apiClient.put as any).mockResolvedValueOnce({});
		await valDetailsService.batchUpdate(1, 2, [mockValDetail]);
		expect(apiClient.put).toHaveBeenCalledWith('/api/val/1/details/batch', { valId: 1, groupId: 2, details: [mockValDetail] });
	});

	it('getByValId propagates errors from apiClient', async () => {
		(apiClient.get as any).mockRejectedValueOnce(new Error('Network error'));
		await expect(valDetailsService.getByValId(1, 2)).rejects.toThrow('Network error');
	});

	it('create propagates errors from apiClient', async () => {
		(apiClient.post as any).mockRejectedValueOnce(new Error('Create failed'));
		await expect(valDetailsService.create(mockValDetail)).rejects.toThrow('Create failed');
	});

	it('update propagates errors from apiClient', async () => {
		(apiClient.put as any).mockRejectedValueOnce(new Error('Update failed'));
		await expect(valDetailsService.update('abc', mockValDetail)).rejects.toThrow('Update failed');
	});

	it('delete propagates errors from apiClient', async () => {
		(apiClient.delete as any).mockRejectedValueOnce(new Error('Delete failed'));
		await expect(valDetailsService.delete('abc', 1)).rejects.toThrow('Delete failed');
	});

	it('batchUpdate propagates errors from apiClient', async () => {
		(apiClient.put as any).mockRejectedValueOnce(new Error('Batch update failed'));
		await expect(valDetailsService.batchUpdate(1, 2, [mockValDetail])).rejects.toThrow('Batch update failed');
	});
});
