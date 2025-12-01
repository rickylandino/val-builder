import { describe, it, expect, vi, beforeEach } from 'vitest';
import { valAnnotationsService } from '@/services/api/valAnnotationsService';
import type { ValAnnotation } from '@/types/api';
import { apiClient } from '@/services/api/client';

const mockAnnotation: ValAnnotation = {
  annotationId: 1,
  author: 'Jane Doe',
  authorId: 'jdoe',
  annotationContent: 'First note',
  annotationGroupId: 'b1a2c3d4-e5f6-7890-abcd-1234567890ab',
  dateModified: '2024-06-01T12:34:56Z',
  valId: 101,
  groupId: 5,
};

describe('valAnnotationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getByValId fetches annotations for a VAL', async () => {
    const getMock = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [mockAnnotation] });
    const result = await valAnnotationsService.getByValId(101);
    expect(getMock).toHaveBeenCalledWith('/api/valannotations/byval/101');
    expect(result).toEqual([mockAnnotation]);
  });

  it('create posts a new annotation', async () => {
    const postMock = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: mockAnnotation });
    const result = await valAnnotationsService.create({
      author: 'Jane Doe',
      authorId: 'jdoe',
      annotationContent: 'New annotation',
      valId: 101,
      groupId: 5,
    });
    expect(postMock).toHaveBeenCalledWith('/api/valannotations', expect.any(Object));
    expect(result).toEqual(mockAnnotation);
  });

  it('delete removes an annotation', async () => {
    const deleteMock = vi.spyOn(apiClient, 'delete').mockResolvedValue({});
    await valAnnotationsService.delete(1);
    expect(deleteMock).toHaveBeenCalledWith('/api/valannotations/1');
  });
});
