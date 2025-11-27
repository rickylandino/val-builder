import { useMutation, useQueryClient, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { companiesService } from '@/services/api/companiesService';
import type { Company, CreateCompany } from '@/types/api';

export const useCompanies = (): UseQueryResult<Company[], Error> => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation<Company, Error, CreateCompany>({
    mutationFn: (company: CreateCompany) => companiesService.create(company),
    onSuccess: () => {
      // Invalidate and refetch companies list
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: Error) => {
      return error;
    },
  });
};