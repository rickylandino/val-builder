import { apiClient } from './client';
import type { ValTemplateItem } from '@/types/api';

const api = "/api/valtemplateitems";

export const valTemplateItemsService = {

  /**
   * Get all companies
   */
  async getAll(groupId: number): Promise<ValTemplateItem[]> {
    const response = await apiClient.get<ValTemplateItem[]>(`${api}?groupId=${groupId}`);
    return response.data;
  }
};