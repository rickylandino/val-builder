import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as service from '@/services/api/valPdfAttachmentsService';
import {
  useValPdfAttachments,
  useUploadPdfAttachment,
  useUpdatePdfAttachment,
  useDeletePdfAttachment,
} from '@/hooks/api/useValPdfAttachments';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useValPdfAttachments hooks', () => {
    it('calls console.error and returns error on upload failure', async () => {
      const error = new Error('upload failed');
      vi.spyOn(service.valPdfAttachmentsService, 'upload').mockRejectedValue(error);
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useUploadPdfAttachment(), { wrapper });
      let caught;
      await act(async () => {
        try {
          await result.current.mutateAsync({ valId: 1, pdfName: 'test', pdfContents: 'base64', displayOrder: 1 });
        } catch (e) {
          caught = e;
        }
      });
      expect(errorSpy).toHaveBeenCalledWith('Failed to upload PDF attachment:', error);
      expect(caught).toBe(error);
      errorSpy.mockRestore();
    });

    it('calls console.error and returns error on update failure', async () => {
      const error = new Error('update failed');
      vi.spyOn(service.valPdfAttachmentsService, 'update').mockRejectedValue(error);
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useUpdatePdfAttachment(), { wrapper });
      let caught;
      await act(async () => {
        try {
          await result.current.mutateAsync({ id: 1, attachment: { pdfName: 'updated' } });
        } catch (e) {
          caught = e;
        }
      });
      expect(errorSpy).toHaveBeenCalledWith('Failed to update PDF attachment:', error);
      expect(caught).toBe(error);
      errorSpy.mockRestore();
    });

    it('calls console.error and returns error on delete failure', async () => {
      const error = new Error('delete failed');
      vi.spyOn(service.valPdfAttachmentsService, 'delete').mockRejectedValue(error);
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useDeletePdfAttachment(), { wrapper });
      let caught;
      await act(async () => {
        try {
          await result.current.mutateAsync({ id: 1, valId: 1 });
        } catch (e) {
          caught = e;
        }
      });
      expect(errorSpy).toHaveBeenCalledWith('Failed to delete PDF attachment:', error);
      expect(caught).toBe(error);
      errorSpy.mockRestore();
    });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches attachments with useValPdfAttachments', async () => {
    const mockData = [{ pdfId: 1, valId: 1, pdfName: 'resume', displayOrder: 1, pdfContents: 'base64' }];
    vi.spyOn(service.valPdfAttachmentsService, 'getByValId').mockResolvedValue(mockData);
    const { result } = renderHook(() => useValPdfAttachments(1), { wrapper });
    await waitFor(() => {
        expect(result.current.status).toBe('success');
        expect(result.current.data).toEqual(mockData);
    });
    
  });

  it('uploads attachment with useUploadPdfAttachment', async () => {
    const mutateSpy = vi.spyOn(service.valPdfAttachmentsService, 'upload').mockResolvedValue({ pdfId: 2, valId: 1 });
    const { result } = renderHook(() => useUploadPdfAttachment(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ valId: 1, pdfName: 'test', pdfContents: 'base64', displayOrder: 1 });
    });
    expect(mutateSpy).toHaveBeenCalledWith({ valId: 1, pdfName: 'test', pdfContents: 'base64', displayOrder: 1 });
  });

  it('updates attachment with useUpdatePdfAttachment', async () => {
    const updateSpy = vi.spyOn(service.valPdfAttachmentsService, 'update').mockResolvedValue({ pdfId: 1, valId: 1 });
    const { result } = renderHook(() => useUpdatePdfAttachment(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: 1, attachment: { pdfName: 'updated' } });
    });
    expect(updateSpy).toHaveBeenCalledWith(1, { pdfName: 'updated' });
  });

  it('deletes attachment with useDeletePdfAttachment', async () => {
    //@ts-ignore
    const deleteSpy = vi.spyOn(service.valPdfAttachmentsService, 'delete').mockResolvedValue({});
    const { result } = renderHook(() => useDeletePdfAttachment(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: 1, valId: 1 });
    });
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});
