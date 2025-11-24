import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { valSectionService } from '@/services/api/valSectionService';
import type { ValSection } from '@/types/api';

export const useValSections = (): UseQueryResult<ValSection[], Error> => {
  return useQuery({
    queryKey: ['valSections'],
    queryFn: () => valSectionService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useValSectionByGroupId = (groupId: number): UseQueryResult<ValSection, Error> => {
  return useQuery({
    queryKey: ['valSection', groupId],
    queryFn: () => valSectionService.getByGroupId(groupId),
    enabled: !!groupId, // Only run if groupId is provided
  });
};

export const useValSectionsByGroupId = (groupId: number): UseQueryResult<ValSection[], Error> => {
  return useQuery({
    queryKey: ['valSections', 'group', groupId],
    queryFn: () => valSectionService.getAllByGroupId(groupId),
    enabled: !!groupId,
  });
};