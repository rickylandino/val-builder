import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { valHeadersService } from '@/services/api/valHeadersService';
import type { ValHeader } from '@/types/api';
import type { CreateValHeader } from '@/types/api/ValHeader';

export const useValHeaders = (planId: number | null) => {
  return useQuery<ValHeader[], Error>({
    queryKey: ['valHeaders', planId],
    queryFn: () => planId ? valHeadersService.getByPlan(planId) : Promise.resolve([]),
    enabled: !!planId,
    staleTime: 5 * 60 * 1000,
  });
};

export function useCreateValHeader() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateValHeader) => {
      return await valHeadersService.createValHeader(payload);
    },
    onSuccess: (_data, variables) => {
      if (variables.planId) {
        queryClient.invalidateQueries({ queryKey: ['valHeaders', variables.planId] });
      }
    },
  });
}
