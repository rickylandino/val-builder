import { apiClient } from './client';
import type { BracketMapping, CreateBracketMapping, UpdateBracketMapping } from '@/types/api/BracketMapping';

const BASE_URL = '/api/bracketmappings';

export const bracketMappingsService = {
  async getAll(): Promise<BracketMapping[]> {
    const response = await apiClient.get(BASE_URL);
    return response.data;
  },

  async create(data: CreateBracketMapping): Promise<BracketMapping> {
    const response = await apiClient.post(BASE_URL, data);
    return response.data;
  },

  async update(data: UpdateBracketMapping): Promise<BracketMapping> {
    const response = await apiClient.put(`${BASE_URL}/${data.id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};
