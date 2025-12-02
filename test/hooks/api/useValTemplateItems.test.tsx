
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { valTemplateItemsService } from '@/services/api/valTemplateItemsService';
import {
	useValTemplateItemsByGroupId,
	useCreateValTemplateItem,
	useUpdateValTemplateItem,
	useDeleteValTemplateItem,
    useUpdateValTemplateItemsDisplayOrder
} from '@/hooks/api/useValTemplateItems';
import type { ValTemplateItem } from '@/types/api';

vi.mock('@/services/api/valTemplateItemsService', () => ({
	valTemplateItemsService: {
		getAll: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
}));

const mockItems = [
	{ id: 1, name: 'Template Item 1', groupId: 1 },
	{ id: 2, name: 'Template Item 2', groupId: 1 },
];

const updatedItem:ValTemplateItem = { itemId: 1, itemText: 'Updated Name', groupId: 1, displayOrder: 1, blankLineAfter: 0, bold: false, center: false, indent: 0, bullet: false, defaultOnVal: false, tightLineHeight: true };

let queryClient: QueryClient;

describe('useValTemplateItems hooks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		queryClient = new QueryClient();
	});

	it('returns template items by groupId', async () => {
		valTemplateItemsService.getAll = vi.fn().mockResolvedValueOnce(mockItems);
		const { result } = renderHook(() => useValTemplateItemsByGroupId(1), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			),
		});
		await waitFor(() => {
			expect(result.current.status).toBe('success');
			expect(result.current.data).toEqual(mockItems);
		});
	});

	it('creates a template item', async () => {
		const newItem = { id: 3, name: 'New Item', groupId: 1 };
		valTemplateItemsService.create = vi.fn().mockResolvedValueOnce(newItem);
		const { result } = renderHook(() => useCreateValTemplateItem(), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			),
		});
		await result.current.mutateAsync({ groupId: 1, templateItemId: 3 });
		expect(valTemplateItemsService.create).toHaveBeenCalledWith(1, 3);
	});

	it('handles error on create', async () => {
		const error = new Error('Create failed');
		valTemplateItemsService.create = vi.fn().mockRejectedValueOnce(error);
		const { result } = renderHook(() => useCreateValTemplateItem(), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			),
		});
		await expect(result.current.mutateAsync({ groupId: 1, templateItemId: 3 })).rejects.toThrow('Create failed');
	});

	it('updates a template item', async () => {
		
		valTemplateItemsService.update = vi.fn().mockResolvedValueOnce(updatedItem);
		const { result } = renderHook(() => useUpdateValTemplateItem(), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			),
		});
		await result.current.mutateAsync(updatedItem);
		expect(valTemplateItemsService.update).toHaveBeenCalledWith(updatedItem);
	});

	it('handles error on update', async () => {
		const error = new Error('Update failed');
		valTemplateItemsService.update = vi.fn().mockRejectedValueOnce(error);
		const { result } = renderHook(() => useUpdateValTemplateItem(), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			),
		});
		await expect(result.current.mutateAsync(updatedItem)).rejects.toThrow('Update failed');
	});

    it('updates a template items display order', async () => {
        valTemplateItemsService.updateDisplayOrder = vi.fn().mockResolvedValueOnce(undefined);
        const { result } = renderHook(() => useUpdateValTemplateItemsDisplayOrder(), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			),
		});
		await result.current.mutateAsync({ groupId: 1, items: [{ itemId: 1, displayOrder: 2 }] });
		expect(valTemplateItemsService.updateDisplayOrder).toHaveBeenCalledWith(1, [{ itemId: 1, displayOrder: 2 }]);
	});

    it('handles error on update display order', async () => {
        const error = new Error('Update display order failed');
        valTemplateItemsService.updateDisplayOrder = vi.fn().mockRejectedValueOnce(error);
        const { result } = renderHook(() => useUpdateValTemplateItemsDisplayOrder(), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			),
		});
		await expect(result.current.mutateAsync({ groupId: 1, items: [{ itemId: 1, displayOrder: 2 }] })).rejects.toThrow('Update display order failed');
	});

	it('deletes a template item', async () => {
		valTemplateItemsService.delete = vi.fn().mockResolvedValueOnce(undefined);
		const { result } = renderHook(() => useDeleteValTemplateItem(), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			),
		});
		await result.current.mutateAsync({ id: 1, groupId: 1 });
		expect(valTemplateItemsService.delete).toHaveBeenCalledWith(1);
	});

	it('handles error on delete', async () => {
		const error = new Error('Delete failed');
		valTemplateItemsService.delete = vi.fn().mockRejectedValueOnce(error);
		const { result } = renderHook(() => useDeleteValTemplateItem(), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			),
		});
		await expect(result.current.mutateAsync({ id: 1, groupId: 1 })).rejects.toThrow('Delete failed');
	});
});
