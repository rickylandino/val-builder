import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { companiesService } from '@/services/api/companiesService';
import { useCompanies, useCreateCompany } from '@/hooks/api/useCompanies';

vi.mock('@/services/api/companiesService', () => ({
    companiesService: {
        getAll: vi.fn(),
        create: vi.fn(),
    },
}));

const mockCompanies = [
    { id: 1, name: 'Acme', plan: 'Pro' },
    { id: 2, name: 'Beta', plan: 'Free' },
];

describe('useCompanies', () => {
    let queryClient: QueryClient;
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
    });

    it('returns companies data', async () => {
        companiesService.getAll.mockResolvedValueOnce(mockCompanies);
        const { result } = renderHook(() => useCompanies(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        await waitFor(() => {
            expect(result.current.status).toBe('success');
            expect(result.current.data).toEqual(mockCompanies);
        });

    });

    it('handles error on create', async () => {
        companiesService.create.mockRejectedValueOnce(new Error('Create failed'));
        const { result } = renderHook(() => useCreateCompany(), {
            wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
        });
        let caughtError: Error | null = null;
        await act(async () => {
            try {
                await result.current.mutateAsync({ name: 'Delta', plan: 'Free' });
            } catch (e: unknown) {
                if (e instanceof Error) {
                    caughtError = e;
                }
            }
        });
        expect(caughtError).toBeInstanceOf(Error);
    });
});

describe('useCreateCompany', () => {
    let queryClient: QueryClient;
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
    });

    it('creates a company and invalidates queries on success', async () => {
        companiesService.create.mockResolvedValueOnce({ id: 3, name: 'Gamma', plan: 'Pro' });
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
        const { result } = renderHook(() => useCreateCompany(), {
            wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
        });
        await act(async () => {
            await result.current.mutateAsync({ name: 'Gamma', plan: 'Pro' });
        });
        expect(companiesService.create).toHaveBeenCalledWith({ name: 'Gamma', plan: 'Pro' });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['companies'] });
    });

    it('handles error on create', async () => {
        companiesService.create.mockRejectedValueOnce(new Error('Create failed'));
        const { result } = renderHook(() => useCreateCompany(), {
            wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
        });
        await act(async () => {
            try {
                await result.current.mutateAsync({ name: 'Delta', plan: 'Free' });
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });
    });
});
