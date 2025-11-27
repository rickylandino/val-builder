import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { valTemplateItemsService } from '@/services/api/valTemplateItemsService';
import { useValTemplateItemsByGroupId } from '@/hooks/api/useValTemplateItems';

vi.mock('@/services/api/valTemplateItemsService', () => ({
	valTemplateItemsService: {
		getAll: vi.fn(),
	},
}));

const mockItems = [
	{ id: 1, name: 'Template Item 1', groupId: 1 },
	{ id: 2, name: 'Template Item 2', groupId: 1 },
];

let queryClient: QueryClient;

describe('useValTemplateItemsByGroupId', () => {
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
});
