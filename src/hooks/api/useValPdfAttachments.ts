import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { valPdfAttachmentsService } from '@/services/api/valPdfAttachmentsService';
import type { ValPdfAttachment } from '@/types/api';

/**
 * Fetch all PDF attachments for a specific VAL
 */
export const useValPdfAttachments = (valId: number): UseQueryResult<ValPdfAttachment[], Error> => {
  return useQuery({
    queryKey: ['valPdfAttachments', valId],
    queryFn: () => valPdfAttachmentsService.getByValId(valId),
    enabled: !!valId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Upload a new PDF attachment
 */
export const useUploadPdfAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachment: Omit<ValPdfAttachment, 'pdfId'>) => 
      valPdfAttachmentsService.upload(attachment),
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch the updated list
      if (variables.valId) {
        void queryClient.invalidateQueries({ queryKey: ['valPdfAttachments', variables.valId] });
      }
    },
    onError: (error: Error) => {
      console.error('Failed to upload PDF attachment:', error);
      return error;
    },
  });
};

/**
 * Update an existing PDF attachment
 */
export const useUpdatePdfAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, attachment }: { id: number; attachment: Partial<ValPdfAttachment> }) =>
      valPdfAttachmentsService.update(id, attachment),
    onSuccess: (data) => {
      // Invalidate queries to refetch the updated list
      if (data.valId) {
        void queryClient.invalidateQueries({ queryKey: ['valPdfAttachments', data.valId] });
      }
    },
    onError: (error: Error) => {
      console.error('Failed to update PDF attachment:', error);
      return error;
    },
  });
};

/**
 * Delete a PDF attachment
 */
export const useDeletePdfAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; valId: number }) =>
      valPdfAttachmentsService.delete(id),
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch the updated list
      void queryClient.invalidateQueries({ queryKey: ['valPdfAttachments', variables.valId] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete PDF attachment:', error);
      return error;
    },
  });
};
