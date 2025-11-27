
const mockValDetails = [
    { id: '1', valId: 1, name: 'Detail 1' },
    { id: '2', valId: 1, name: 'Detail 2' },
];
const mockCreatedDetail = { id: '3', valId: 1, name: 'Detail 3' };

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useValDetails, useCreateValDetail, useUpdateValDetail, useSaveValChanges, useDeleteValDetail, useBatchUpdateValDetails } from '@/hooks/api/useValDetails';
import { valDetailsService } from '@/services/api/valDetailsService';


let queryClient: QueryClient;

describe('useUpdateValDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
    });
    it('updates a val detail successfully', async () => {
        const mockUpdatedDetail = { id: '1', valId: 1, name: 'Updated Detail' };
        valDetailsService.update = vi.fn().mockResolvedValueOnce(mockUpdatedDetail);

        const { result } = renderHook(() => useUpdateValDetail(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        act(() => {
            result.current.mutate({ valDetailsID: '1', valDetail: { name: 'Updated Detail', valId: 1 } });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data).toEqual(mockUpdatedDetail);
        });
    });
    it('handles error on update', async () => {
        const { result } = renderHook(() => useUpdateValDetail(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        act(() => {
            result.current.mutate({ valDetailsID: '1', valDetail: { name: 'Updated Detail', valId: 1 } });
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error.message).toBe("Cannot read properties of undefined (reading 'valId')");
        });
    });
});

describe('useDeleteValDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
    });
    it('deletes a val detail successfully', async () => {
        valDetailsService.delete = vi.fn().mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useDeleteValDetail(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        act(() => {
            result.current.mutate({ valDetailsID: '1', valId: 1 });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });
    });
    it('handles error on delete', async () => {
        valDetailsService.delete = vi.fn().mockRejectedValueOnce(new Error('Delete failed'));
        const { result } = renderHook(() => useDeleteValDetail(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        act(() => {
            result.current.mutate({ valDetailsID: '1', valId: 1 });
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error.message).toBe('Delete failed');
        });
    });
});

describe('useBatchUpdateValDetails', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
    });
    it('batch updates val details successfully', async () => {
        valDetailsService.batchUpdate = vi.fn().mockResolvedValueOnce(undefined);
        const { result } = renderHook(() => useBatchUpdateValDetails(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        act(() => {
            result.current.mutate({ valId: 1, groupId: 1, details: mockValDetails });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });
    });
    it('handles error on batch update', async () => {
        valDetailsService.batchUpdate = vi.fn().mockRejectedValueOnce(new Error('Batch update failed'));
        const { result } = renderHook(() => useBatchUpdateValDetails(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        act(() => {
            result.current.mutate({ valId: 1, groupId: 1, details: mockValDetails });
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error.message).toBe('Batch update failed');
        });
    });
});

describe('useSaveValChanges', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
    });
    it('saves val changes successfully', async () => {
        valDetailsService.saveChanges = vi.fn().mockResolvedValueOnce(undefined);
        const { result } = renderHook(() => useSaveValChanges(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        act(() => {
            result.current.mutate({ valId: 1, changes: [] });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });
    });
    it('handles error on save changes', async () => {
        valDetailsService.saveChanges = vi.fn().mockRejectedValueOnce(new Error('Save changes failed'));

        const { result } = renderHook(() => useSaveValChanges(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        act(() => {
            result.current.mutate({ valId: 1, changes: [] });
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error.message).toBe('Save changes failed');
        });
    });
});

describe('useValDetails hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient();
    });

    it('returns val details data', async () => {
        valDetailsService.getByValId = vi.fn().mockResolvedValueOnce(mockValDetails);
        const { result } = renderHook(() => useValDetails(1), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
        await waitFor(() => {
            expect(result.current.status).toBe('success');
            expect(result.current.data).toEqual(mockValDetails);
        });
    });

    describe('useCreateValDetail', () => {
        it('creates a val detail successfully', async () => {
            valDetailsService.create = vi.fn().mockResolvedValueOnce(mockCreatedDetail);
            const { result } = renderHook(() => useCreateValDetail(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });
            act(() => {
                result.current.mutate({ valId: 1, name: 'Detail 3' });
            });
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
                expect(result.current.data).toEqual(mockCreatedDetail);
            });
        });

        it('handles error on create', async () => {
            valDetailsService.create = vi.fn().mockRejectedValueOnce(new Error('Create failed'));
            const { result } = renderHook(() => useCreateValDetail(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });
            act(() => {
                result.current.mutate({ valId: 1, name: 'Detail 3' });
            });
            await waitFor(() => {
                expect(result.current.isError).toBe(true);
                expect(result.current.error).toBeInstanceOf(Error);
                expect(result.current.error.message).toBe('Create failed');
            });
        });
    });
});
