import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { valHeadersService } from '@/services/api/valHeadersService';
import { useValHeaders, useCreateValHeader } from '@/hooks/api/useValHeaders';

vi.mock('@/services/api/valHeadersService', () => ({
    valHeadersService: {
        getByPlan: vi.fn(),
        createValHeader: vi.fn(),
    },
}));

const mockHeaders = [
    { id: 1, name: 'Header 1', planId: 1 },
    { id: 2, name: 'Header 2', planId: 1 },
];

let queryClient: QueryClient;

describe('useValHeaders', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
    });

    it('returns val headers data', async () => {
        valHeadersService.getByPlan = vi.fn().mockResolvedValueOnce(mockHeaders);
        const { result } = renderHook(() => useValHeaders(1), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        await waitFor(() => {
            expect(result.current.status).toBe('success');
            expect(result.current.data).toEqual(mockHeaders);
        });
    });
});

describe('useCreateValHeader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
    });

    it('creates a val header successfully', async () => {
        const mockHeader = { id: 3, name: 'Header 3', planId: 1 };
        valHeadersService.createValHeader = vi.fn().mockResolvedValueOnce(mockHeader);
        const { result } = renderHook(() => useCreateValHeader(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        act(() => {
            result.current.mutate({ name: 'Header 3', planId: 1 });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data).toEqual(mockHeader);
        });
    });

    it('handles error on create', async () => {
        valHeadersService.createValHeader = vi.fn().mockRejectedValueOnce(new Error('Create failed'));
        const { result } = renderHook(() => useCreateValHeader(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        act(() => {
            result.current.mutate({ name: 'Header 3', planId: 1 });
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error.message).toBe('Create failed');
        });
    });
});
