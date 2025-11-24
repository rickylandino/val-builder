import { apiClient } from './client';
import type { ValHeader } from '@/types/api';
import type { CreateValHeader } from '@/types/api/ValHeader';

const api = '/api/valheader';

export const valHeadersService = {
  /**
   * Get all ValHeaders for a company
   */
  async getByCompany(companyId: number): Promise<ValHeader[]> {
    const response = await apiClient.get<ValHeader[]>(`${api}?companyId=${companyId}`);
    return response.data;
  },

  /**
   * Get all ValHeaders for a plan
   */
  async getByPlan(planId: number): Promise<ValHeader[]> {
    const response = await apiClient.get<ValHeader[]>(`${api}?planId=${planId}`);
    return response.data;
  },

  /**
   * Create a new ValHeader
   * @param valHeader 
   * @returns 
   */
  async createValHeader(valHeader: CreateValHeader): Promise<ValHeader> {
    const response = await apiClient.post<ValHeader>(api, valHeader);
    return response.data;
  }
};
