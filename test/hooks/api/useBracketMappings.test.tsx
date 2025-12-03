import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as service from '@/services/api/bracketMappingsService';
import {
  useBracketMappings,
  useCreateBracketMapping,
  useUpdateBracketMapping,
  useDeleteBracketMapping,
} from '@/hooks/api/useBracketMappings';

vi.mock('@/services/api/bracketMappingsService');

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useBracketMappings hooks', () => {
  const mockMapping = { id: 1, tagName: 'PYE', objectPath: 'valHeader.planYearEndDate', description: 'desc', systemTag: true };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches bracket mappings', async () => {
    (service.bracketMappingsService.getAll as any).mockResolvedValue([mockMapping]);
    const { result } = renderHook(() => useBracketMappings(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual([mockMapping]));
  });

  it('creates a bracket mapping', async () => {
    (service.bracketMappingsService.create as any).mockResolvedValue(mockMapping);
    const { result } = renderHook(() => useCreateBracketMapping(), { wrapper });
    const { mutateAsync } = result.current;
    const data = { tagName: 'PYE', objectPath: 'valHeader.planYearEndDate', description: 'desc' };
    await expect(mutateAsync(data as any)).resolves.toEqual(mockMapping);
    expect(service.bracketMappingsService.create).toHaveBeenCalledWith(data);
  });

  it('updates a bracket mapping', async () => {
    (service.bracketMappingsService.update as any).mockResolvedValue(mockMapping);
    const { result } = renderHook(() => useUpdateBracketMapping(), { wrapper });
    const { mutateAsync } = result.current;
    const data = { id: 1, tagName: 'PYE', objectPath: 'valHeader.planYearEndDate', description: 'desc', systemTag: true };
    await expect(mutateAsync(data as any)).resolves.toEqual(mockMapping);
    expect(service.bracketMappingsService.update).toHaveBeenCalledWith(data);
  });

  it('deletes a bracket mapping', async () => {
    (service.bracketMappingsService.delete as any).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteBracketMapping(), { wrapper });
    const { mutateAsync } = result.current;
    await expect(mutateAsync(1)).resolves.toBeUndefined();
    expect(service.bracketMappingsService.delete).toHaveBeenCalledWith(1);
  });
});
