import { apiClient } from './client';
import type { ValSection } from '@/types/api';

const api = "/api/valsections";

export const valSectionService = {
  /**
   * Get all ValSections ordered by DisplayOrder
   */
  async getAll(): Promise<ValSection[]> {
    const response = await apiClient.get<ValSection[]>(api);
    return response.data;
  },

  /**
   * Get first ValSection by GroupId
   * @param groupId - The group identifier
   * @throws 404 if not found
   */
  async getByGroupId(groupId: number): Promise<ValSection> {
    const response = await apiClient.get<ValSection>(`${api}/${groupId}`);
    return response.data;
  },

  /**
   * Get all ValSections for a specific GroupId
   * @param groupId - The group identifier
   */
  async getAllByGroupId(groupId: number): Promise<ValSection[]> {
    const response = await apiClient.get<ValSection[]>(`${api}/group/${groupId}`);
    return response.data;
  },
};