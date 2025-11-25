import { apiClient } from './client';
import type { ValDetail, CreateValDetail } from '@/types/api/ValDetail';
import type { ValDetailChange } from '@/lib/valChangesTracker';

const api = "/api/val";

export const valDetailsService = {
  /**
   * Get all ValDetails for a specific VAL and optional groupId
   * @param valId - The VAL identifier
   * @param groupId - Optional group identifier to filter by section
   */
  async getByValId(valId: number, groupId?: number): Promise<ValDetail[]> {
    const params = groupId ? `?groupId=${groupId}` : '';
    const response = await apiClient.get<ValDetail[]>(`${api}/${valId}/details${params}`);
    return response.data;
  },

  /**
   * Create a new ValDetail
   * @param valDetail - The ValDetail to create
   */
  async create(valDetail: CreateValDetail): Promise<ValDetail> {
    const response = await apiClient.post<ValDetail>(`${api}/${valDetail.valId}/details`, valDetail);
    return response.data;
  },

  /**
   * Update an existing ValDetail
   * @param valDetailsId - The detail identifier (GUID)
   * @param valDetail - The updated ValDetail data
   */
  async update(valDetailsId: string, valDetail: Partial<ValDetail>): Promise<ValDetail> {
    const response = await apiClient.put<ValDetail>(`${api}/${valDetail.valId}/details/${valDetailsId}`, valDetail);
    return response.data;
  },

  /**
   * Delete a ValDetail
   * @param valDetailsId - The detail identifier (GUID)
   * @param valId - The VAL identifier
   */
  async delete(valDetailsId: string, valId: number): Promise<void> {
    await apiClient.delete(`${api}/${valId}/details/${valDetailsId}`);
  },

  /**
   * Batch update ValDetails (for reordering)
   * @param valId - The VAL identifier
   * @param groupId - The group identifier
   * @param details - Array of ValDetails with updated display orders
   */
  async batchUpdate(valId: number, groupId: number, details: ValDetail[]): Promise<void> {
    await apiClient.put(`${api}/${valId}/details/batch`, { valId, groupId, details });
  },

  /**
   * Save all changes (creates, updates, deletes) in a single transaction
   * @param valId - The VAL identifier
   * @param changes - Array of changes to apply
   */
  async saveChanges(valId: number, changes: ValDetailChange[]): Promise<void> {
    await apiClient.post(`${api}/${valId}/details/save-changes`, { valId, changes });
  },
};