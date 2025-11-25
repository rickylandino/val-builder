import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { valDetailsService } from '@/services/api/valDetailsService';
import type { ValDetail, CreateValDetail } from '@/types/api/ValDetail';
import type { ValDetailChange } from '@/lib/valChangesTracker';

/**
 * Fetch ValDetails for a specific VAL and optional section
 */
export const useValDetails = (valId: number, groupId?: number): UseQueryResult<ValDetail[], Error> => {
  return useQuery({
    queryKey: ['valDetails', valId, groupId],
    queryFn: () => valDetailsService.getByValId(valId, groupId),
    enabled: !!valId,
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent refetching when switching sections
    gcTime: 10 * 60 * 1000, // 10 minutes - keep data in cache
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
};

/**
 * Fetch all ValDetails for a VAL (all sections at once)
 */
export const useAllValDetails = (valId: number): UseQueryResult<ValDetail[], Error> => {
  return useQuery({
    queryKey: ['valDetails', valId],
    queryFn: () => valDetailsService.getByValId(valId),
    enabled: !!valId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Create a new ValDetail
 */
export const useCreateValDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (valDetail: CreateValDetail) => valDetailsService.create(valDetail),
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch the updated data
      void queryClient.invalidateQueries({ queryKey: ['valDetails', variables.valId] });
    },
  });
};

/**
 * Update an existing ValDetail
 */
export const useUpdateValDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ valDetailsID, valDetail }: { valDetailsID: string; valDetail: Partial<ValDetail> }) =>
      valDetailsService.update(valDetailsID, valDetail),
    onSuccess: (data) => {
      // Invalidate queries to refetch the updated data
      void queryClient.invalidateQueries({ queryKey: ['valDetails', data.valId] });
    },
  });
};

/**
 * Delete a ValDetail
 */
export const useDeleteValDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ valDetailsID, valId }: { valDetailsID: string; valId: number }) =>
      valDetailsService.delete(valDetailsID, valId),
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch the updated data
      void queryClient.invalidateQueries({ queryKey: ['valDetails', variables.valId] });
    },
  });
};

/**
 * Batch update ValDetails (for reordering)
 */
export const useBatchUpdateValDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ valId, groupId, details }: { valId: number; groupId: number; details: ValDetail[] }) =>
      valDetailsService.batchUpdate(valId, groupId, details),
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch the updated data
      void queryClient.invalidateQueries({ queryKey: ['valDetails', variables.valId] });
    },
  });
};

/**
 * Save all changes (creates, updates, deletes) in a single transaction
 */
export const useSaveValChanges = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ valId, changes }: { valId: number; changes: ValDetailChange[] }) =>
      valDetailsService.saveChanges(valId, changes),
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch all the updated data
      void queryClient.invalidateQueries({ queryKey: ['valDetails', variables.valId] });
    },
  });
};