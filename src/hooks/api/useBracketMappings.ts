import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bracketMappingsService } from '@/services/api/bracketMappingsService';
import type { CreateBracketMapping, UpdateBracketMapping } from '@/types/api/BracketMapping';

const QUERY_KEY = ['bracketMappings'];

export function useBracketMappings() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => bracketMappingsService.getAll(),
  });
}

export function useCreateBracketMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBracketMapping) => bracketMappingsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateBracketMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBracketMapping) => bracketMappingsService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteBracketMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bracketMappingsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
