import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
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


export const useCreateValTemplateItem = (): UseMutationResult<ValTemplateItem, Error, { groupId: number; templateItemId: number }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId, templateItemId }) => valTemplateItemsService.create(groupId, templateItemId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['valTemplateItems', variables.groupId] });
        },
        onError: (error: Error) => {
            return error;
        },
    });
};

export const useUpdateValTemplateItem = (): UseMutationResult<ValTemplateItem, Error, ValTemplateItem> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item) => valTemplateItemsService.update(item),
        onSuccess: (updatedItem) => {
            queryClient.invalidateQueries({ queryKey: ['valTemplateItems', updatedItem.groupId] });
        },
        onError: (error: Error) => {
            return error;
        },
    });
};

export const useUpdateValTemplateItemsDisplayOrder = (): UseMutationResult<void, Error, { groupId: number; items: Array<{ itemId: number; displayOrder: number }> }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId, items }) => valTemplateItemsService.updateDisplayOrder(groupId, items),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['valTemplateItems', variables.groupId] });
        },
        onError: (error: Error) => {
            return error;
        },
    });
};

export const useDeleteValTemplateItem = (): UseMutationResult<void, Error, { id: number; groupId: number }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }) => valTemplateItemsService.delete(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['valTemplateItems', variables.groupId] });
        },
        onError: (error: Error) => {
            return error;
        },
    });
};
