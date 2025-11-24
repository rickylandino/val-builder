import { apiClient } from './client';
import type { Company, CreateCompany } from '@/types/api';

const api = "/api/companies";

export const companiesService = {

  /**
   * Get all companies
   */
  async getAll(): Promise<Company[]> {
    const response = await apiClient.get<Company[]>(api);
    return response.data;
  },

  /**
   * Create a new company
   */
  async create(company: CreateCompany): Promise<Company> {
    const response = await apiClient.post<Company>(api, company);
    return response.data;
  }
};