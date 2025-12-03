import { apiClient } from './client';
import type { CompanyPlan } from '@/types/api';

const api = '/api/companyplan';

export const companyPlansService = {
  async get(planId: number): Promise<CompanyPlan> {
    const { data } = await apiClient.get(`${api}/${planId}`);
    return data;
  },
  async getByCompany(companyId: number): Promise<CompanyPlan[]> {
    const { data } = await apiClient.get(`${api}?companyId=${companyId}`);
    return data;
  },
  async create(companyId: number, payload: Partial<CompanyPlan>): Promise<CompanyPlan> {
    // Accepts: { companyId, planType, planName, planYearEnd, tech }
    const { data } = await apiClient.post(api, { ...payload, companyId });
    return data;
  },
};
