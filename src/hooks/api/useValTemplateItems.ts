import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { valTemplateItemsService } from '@/services/api/valTemplateItemsService';
import type { ValTemplateItem } from '@/types/api/ValTemplateItem';

export const useValTemplateItemsByGroupId = (groupId: number): UseQueryResult<ValTemplateItem[], Error> => {
  return useQuery({
    queryKey: ['valTemplateItems', groupId],
    queryFn: () => valTemplateItemsService.getAll(groupId),
    enabled: !!groupId,
    staleTime: 10 * 60 * 1000, // 10 minutes - template items rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false,
  });
};
