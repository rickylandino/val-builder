import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { companyPlansService } from '@/services/api/companyPlansService';
import { useCompanyPlans, useCreateCompanyPlan } from '@/hooks/api/useCompanyPlans';

vi.mock('@/services/api/companyPlansService', () => ({
    companyPlansService: {
        getAll: vi.fn(),
        getByCompany: vi.fn(),
        create: vi.fn(),
    },
}));

const mockPlans = [
    { id: 1, name: 'Starter', price: 10 },
    { id: 2, name: 'Pro', price: 30 },
];

let queryClient: QueryClient;

describe('useCompanyPlans', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
    });

    it('returns company plans data', async () => {
        companyPlansService.getByCompany = vi.fn().mockResolvedValueOnce(mockPlans);
        const { result } = renderHook(() => useCompanyPlans(1), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        await waitFor(() => {
            expect(result.current.status).toBe('success');
            expect(result.current.data).toEqual(mockPlans);
        });
    });
});

describe('useCreateCompanyPlan', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
    });

    it('creates a company plan successfully', async () => {
        const mockPlan = { id: 3, name: 'Enterprise', price: 100 };
        companyPlansService.create = vi.fn().mockResolvedValueOnce(mockPlan);

        const { result } = renderHook(() => useCreateCompanyPlan(1), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        act(() => {
            result.current.mutate({ name: 'Enterprise', price: 100 });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data).toEqual(mockPlan);
        });
    });

    it('handles error on create', async () => {
        companyPlansService.create = vi.fn().mockRejectedValueOnce(new Error('Create failed'));
        
        const { result } = renderHook(() => useCreateCompanyPlan(1), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        act(() => {
            result.current.mutate({ name: 'Enterprise', price: 100 });
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error.message).toBe('Create failed');
        });
    });
});
