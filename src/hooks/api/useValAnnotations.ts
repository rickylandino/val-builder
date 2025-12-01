import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { valAnnotationsService, type ValAnnotation } from '@/services/api/valAnnotationsService';

/**
 * Fetch all annotations for a specific VAL
 */
export const useValAnnotations = (valId: number): UseQueryResult<ValAnnotation[], Error> => {
  return useQuery({
    queryKey: ['valAnnotations', valId],
    queryFn: () => valAnnotationsService.getByValId(valId),
    enabled: !!valId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new annotation
 */
export const useCreateValAnnotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (annotation: Omit<ValAnnotation, 'annotationId' | 'dateModified' | 'annotationGroupId'>) =>
      valAnnotationsService.create(annotation),
    onSuccess: (_, variables) => {
      if (variables.valId) {
        void queryClient.invalidateQueries({ queryKey: ['valAnnotations', variables.valId] });
      }
    },
    onError: (error: Error) => {
      console.error('Failed to create annotation:', error);
      return error;
    },
  });
};

/**
 * Delete an annotation
 */
export const useDeleteValAnnotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, valId }: { id: number; valId: number }) => valAnnotationsService.delete(id),
    onSuccess: (_, variables) => {
      if (variables.valId) {
        void queryClient.invalidateQueries({ queryKey: ['valAnnotations', variables.valId] });
      }
    },
    onError: (error: Error) => {
      console.error('Failed to delete annotation:', error);
      return error;
    },
  });
};
