import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyPlansService } from '@/services/api/companyPlansService';

export function useCompanyPlan(planId: number | null) {
  return useQuery({
    queryKey: ['companyPlan', planId],
    queryFn: () => planId ? companyPlansService.get(planId) : null,
    enabled: !!planId,
  });
}

export function useCompanyPlans(companyId: number | null) {
  return useQuery({
    queryKey: ['companyPlans', companyId],
    queryFn: () => companyId ? companyPlansService.getByCompany(companyId) : [],
    enabled: !!companyId,
  });
}

export function useCreateCompanyPlan(companyId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => companyId ? companyPlansService.create(companyId, payload) : Promise.reject(new Error('No companyId')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyPlans', companyId] });
    },
    onError: (error: Error) => {
      return error;
    },
  });
}
