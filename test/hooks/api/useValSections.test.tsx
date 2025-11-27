import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { valSectionService } from '@/services/api/valSectionService';
import { useValSections, useValSectionByGroupId, useValSectionsByGroupId } from '@/hooks/api/useValSections';

vi.mock('@/services/api/valSectionService', () => ({
	valSectionService: {
		getAll: vi.fn(),
		getByGroupId: vi.fn(),
		getAllByGroupId: vi.fn(),
	},
}));

const mockSections = [
	{ id: 1, name: 'Section 1', groupId: 1 },
	{ id: 2, name: 'Section 2', groupId: 1 },
];

const mockSection = { id: 1, name: 'Section 1', groupId: 1 };

let queryClient: QueryClient;

describe('useValSections', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		queryClient = new QueryClient();
	});

	it('returns all val sections', async () => {
		valSectionService.getAll = vi.fn().mockResolvedValueOnce(mockSections);
		const { result } = renderHook(() => useValSections(), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			),
		});
		await waitFor(() => {
			expect(result.current.status).toBe('success');
			expect(result.current.data).toEqual(mockSections);
		});
	});
});

describe('useValSectionByGroupId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		queryClient = new QueryClient();
	});

	it('returns val section by groupId', async () => {
		valSectionService.getByGroupId = vi.fn().mockResolvedValueOnce(mockSection);
		const { result } = renderHook(() => useValSectionByGroupId(1), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			),
		});
		await waitFor(() => {
			expect(result.current.status).toBe('success');
			expect(result.current.data).toEqual(mockSection);
		});
	});
});

describe('useValSectionsByGroupId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		queryClient = new QueryClient();
	});

	it('returns all val sections by groupId', async () => {
		valSectionService.getAllByGroupId = vi.fn().mockResolvedValueOnce(mockSections);
		const { result } = renderHook(() => useValSectionsByGroupId(1), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			),
		});
		await waitFor(() => {
			expect(result.current.status).toBe('success');
			expect(result.current.data).toEqual(mockSections);
		});
	});
});
