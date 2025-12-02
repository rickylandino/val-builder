import { apiClient } from './client';
import type { ValTemplateItem } from '@/types/api';

const api = "/api/valtemplateitems";

export const valTemplateItemsService = {

    /**
     * Get all template items by group
     */
    async getAll(groupId: number): Promise<ValTemplateItem[]> {
        const response = await apiClient.get<ValTemplateItem[]>(`${api}?groupId=${groupId}`);
        return response.data;
    },

    /**
     * Insert template item
     */
    async create(groupId: number, templateItemId: number): Promise<ValTemplateItem> {
        const response = await apiClient.post<ValTemplateItem>(`${api}`, { groupId, templateItemId });
        return response.data;
    },

    /**
     * Update template item
     */
    async update(item: ValTemplateItem): Promise<ValTemplateItem> {
        const response = await apiClient.put<ValTemplateItem>(`${api}/${item.itemId}`, item);
        return response.data;
    },

    /**
     * Update display order for template items in a group
     */
    async updateDisplayOrder(groupId: number, items: Array<{ itemId: number; displayOrder: number }>): Promise<void> {
        const putData = {
            groupId,
            items
        }
        const response = await apiClient.put(`${api}/displayorder`, putData);
        return response.data;
    },

    /**
     * Delete template item
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`${api}/${id}`);
    }
};