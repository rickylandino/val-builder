import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as service from '@/services/api/valAnnotationsService';
import {
  useValAnnotations,
  useCreateValAnnotation,
  useDeleteValAnnotation,
} from '@/hooks/api/useValAnnotations';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const mockAnnotation = {
  annotationId: 1,
  author: 'Jane Doe',
  authorId: 'jdoe',
  annotationContent: 'First note',
  annotationGroupId: 'b1a2c3d4-e5f6-7890-abcd-1234567890ab',
  dateModified: '2024-06-01T12:34:56Z',
  valId: 101,
  groupId: 5,
};

describe('useValAnnotations hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches annotations for a VAL', async () => {
    vi.spyOn(service.valAnnotationsService, 'getByValId').mockResolvedValue([mockAnnotation]);
    const { result } = renderHook(() => useValAnnotations(101), { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe('success');
      expect(result.current.data).toEqual([mockAnnotation]);
    });
  });

  it('creates a new annotation', async () => {
    const mutateSpy = vi.spyOn(service.valAnnotationsService, 'create').mockResolvedValue(mockAnnotation);
    const { result } = renderHook(() => useCreateValAnnotation(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        author: 'Jane Doe',
        authorId: 'jdoe',
        annotationContent: 'New annotation',
        valId: 101,
        groupId: 5,
      });
    });
    expect(mutateSpy).toHaveBeenCalledWith({
      author: 'Jane Doe',
      authorId: 'jdoe',
      annotationContent: 'New annotation',
      valId: 101,
      groupId: 5,
    });
  });

  it('deletes an annotation', async () => {
    //@ts-ignore
    const deleteSpy = vi.spyOn(service.valAnnotationsService, 'delete').mockResolvedValue({});
    const { result } = renderHook(() => useDeleteValAnnotation(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: 1, valId: 101 });
    });
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it('calls console.error and returns error on create failure', async () => {
    const error = new Error('create failed');
    vi.spyOn(service.valAnnotationsService, 'create').mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useCreateValAnnotation(), { wrapper });
    let caught;
    await act(async () => {
      try {
        await result.current.mutateAsync({
          author: 'Jane Doe',
          authorId: 'jdoe',
          annotationContent: 'New annotation',
          valId: 101,
          groupId: 5,
        });
      } catch (e) {
        caught = e;
      }
    });
    expect(errorSpy).toHaveBeenCalledWith('Failed to create annotation:', error);
    expect(caught).toBe(error);
    errorSpy.mockRestore();
  });

  it('calls console.error and returns error on delete failure', async () => {
    const error = new Error('delete failed');
    vi.spyOn(service.valAnnotationsService, 'delete').mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useDeleteValAnnotation(), { wrapper });
    let caught;
    await act(async () => {
      try {
        await result.current.mutateAsync({ id: 1, valId: 101 });
      } catch (e) {
        caught = e;
      }
    });
    expect(errorSpy).toHaveBeenCalledWith('Failed to delete annotation:', error);
    expect(caught).toBe(error);
    errorSpy.mockRestore();
  });
});
