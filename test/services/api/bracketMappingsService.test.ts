import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bracketMappingsService } from '@/services/api/bracketMappingsService';
import { apiClient } from '@/services/api/client';

vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('bracketMappingsService', () => {
  const mockMapping = { id: 1, tagName: 'PYE', objectPath: 'valHeader.planYearEndDate', description: 'desc', systemTag: true };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll fetches all mappings', async () => {
    (apiClient.get as any).mockResolvedValue({ data: [mockMapping] });
    const result = await bracketMappingsService.getAll();
    expect(apiClient.get).toHaveBeenCalledWith('/api/bracketmappings');
    expect(result).toEqual([mockMapping]);
  });

  it('create posts a new mapping', async () => {
    (apiClient.post as any).mockResolvedValue({ data: mockMapping });
    const data = { tagName: 'PYE', objectPath: 'valHeader.planYearEndDate', description: 'desc' };
    const result = await bracketMappingsService.create(data as any);
    expect(apiClient.post).toHaveBeenCalledWith('/api/bracketmappings', data);
    expect(result).toEqual(mockMapping);
  });

  it('update puts an updated mapping', async () => {
    (apiClient.put as any).mockResolvedValue({ data: mockMapping });
    const data = { id: 1, tagName: 'PYE', objectPath: 'valHeader.planYearEndDate', description: 'desc', systemTag: true };
    const result = await bracketMappingsService.update(data as any);
    expect(apiClient.put).toHaveBeenCalledWith('/api/bracketmappings/1', data);
    expect(result).toEqual(mockMapping);
  });

  it('delete removes a mapping', async () => {
    (apiClient.delete as any).mockResolvedValue({ data: undefined });
    await bracketMappingsService.delete(1);
    expect(apiClient.delete).toHaveBeenCalledWith('/api/bracketmappings/1');
  });
});
